import csv
import io
import ipaddress
import socket
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import urlparse

import httpx
import openpyxl
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.constants import Gender
from app.models.attributes import AttributeType, AttributeValue
from app.models.catalog import Brand, Category, MechanismType, Product
from app.schemas.admin_import import ProductImportReport, ProductImportRowError
from app.schemas.admin_product import ProductCreateRequest, ProductUpdateRequest
from app.services.admin_product_service import (
    ALLOWED_IMAGE_EXTENSIONS,
    InvalidImageError,
    add_product_image_from_bytes,
    create_product,
    get_product_by_sku,
    update_product,
)

ALLOWED_IMPORT_EXTENSIONS = {".csv", ".xlsx"}
MAX_IMAGE_DOWNLOAD_BYTES = 8 * 1024 * 1024

# Гарантія — загальна умова магазину (єдиний термін для всього асортименту,
# узгоджується напряму з постачальником), не властивість конкретної моделі.
# Тому імпорт завжди підставляє цю константу, а не читає її з файлу.
DEFAULT_WARRANTY_MONTHS = 12

IMAGE_CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

# Фіксовані колонки товару, в порядку для шаблону. Будь-яка інша колонка
# з заголовком, що збігається з назвою наявного attribute_type, трактується
# як атрибут (EAV) — жодних змін коду не потрібно при додаванні нового типу
# атрибута в адмінці.
FIXED_COLUMNS_ORDER = (
    "Назва",
    "Опис",
    "Ціна",
    "Стара_ціна",
    "Артикул",
    "Категорія",
    "Бренд",
    "Тип_механізму",
    "Стать",
    "Діаметр_мм",
    "Товщина_мм",
    "Комплектація",
    "Активний",
    "Фото",
)
FIXED_COLUMNS = set(FIXED_COLUMNS_ORDER)

TEMPLATE_EXAMPLE_ROW = {
    "Назва": "Casio Heritage MTP-1234",
    "Опис": "Класичний чоловічий годинник",
    "Ціна": "2400",
    "Стара_ціна": "",
    "Артикул": "CAS-MTP-1234",
    "Категорія": "Класичні",
    "Бренд": "Casio",
    "Тип_механізму": "Кварц",
    "Стать": "Чоловічі",
    "Діаметр_мм": "40",
    "Товщина_мм": "",
    "Комплектація": "Коробка, гарантійний талон",
    "Активний": "так",
    "Фото": "https://example.com/photo1.jpg;https://example.com/photo2.jpg",
}

GENDER_LABELS = {
    "чоловічі": Gender.male,
    "жіночі": Gender.female,
    "унісекс": Gender.unisex,
}

TRUE_LABELS = {"так", "true", "1", "yes"}
FALSE_LABELS = {"ні", "false", "0", "no"}


class ImportFileError(Exception):
    pass


class CategoryNotFoundForImportError(Exception):
    def __init__(self, name: str):
        self.name = name
        super().__init__(f"Категорію «{name}» не знайдено — спершу створіть її в адмінці")


class ImageDownloadError(Exception):
    pass


def parse_import_file(filename: str, content: bytes) -> list[dict[str, str]]:
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in ALLOWED_IMPORT_EXTENSIONS:
        raise ImportFileError("Дозволені формати файлу: .csv, .xlsx")

    if extension == ".csv":
        return _parse_csv(content)
    return _parse_xlsx(content)


def _parse_csv(content: bytes) -> list[dict[str, str]]:
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    rows: list[dict[str, str]] = []
    for raw_row in reader:
        rows.append({(key or "").strip(): (value or "").strip() for key, value in raw_row.items()})
    return rows


def _parse_xlsx(content: bytes) -> list[dict[str, str]]:
    workbook = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    sheet = workbook.worksheets[0]

    rows_iter = sheet.iter_rows(values_only=True)
    try:
        header_row = next(rows_iter)
    except StopIteration:
        return []

    headers = [str(cell).strip() if cell is not None else "" for cell in header_row]

    rows: list[dict[str, str]] = []
    for raw_row in rows_iter:
        if all(cell is None for cell in raw_row):
            continue
        row: dict[str, str] = {}
        for header, cell in zip(headers, raw_row):
            if not header:
                continue
            row[header] = "" if cell is None else str(cell).strip()
        rows.append(row)
    return rows


def parse_gender(value: str) -> Gender:
    label = value.strip().lower()
    gender = GENDER_LABELS.get(label)
    if gender is None:
        raise ValueError(
            f"Невідоме значення статі «{value}» — очікується Чоловічі / Жіночі / Унісекс"
        )
    return gender


def parse_bool(value: str, default: bool = True) -> bool:
    label = value.strip().lower()
    if not label:
        return default
    if label in TRUE_LABELS:
        return True
    if label in FALSE_LABELS:
        return False
    raise ValueError(f"Невідоме значення «{value}» — очікується так/ні")


def parse_required_decimal(value: str, field_label: str) -> Decimal:
    try:
        parsed = Decimal(value.strip().replace(",", "."))
    except (InvalidOperation, AttributeError) as exc:
        raise ValueError(f"Поле «{field_label}» має бути числом") from exc
    if parsed < 0:
        raise ValueError(f"Поле «{field_label}» не може бути від'ємним")
    return parsed


def parse_optional_decimal(value: str, field_label: str) -> Decimal | None:
    if not value.strip():
        return None
    return parse_required_decimal(value, field_label)


def parse_optional_int(value: str, field_label: str) -> int | None:
    if not value.strip():
        return None
    try:
        return int(value.strip())
    except ValueError as exc:
        raise ValueError(f"Поле «{field_label}» має бути цілим числом") from exc


def resolve_category(db: Session, name: str) -> Category:
    category = db.scalar(select(Category).where(func.lower(Category.name) == name.strip().lower()))
    if category is None:
        raise CategoryNotFoundForImportError(name)
    return category


def get_or_create_brand(db: Session, name: str) -> Brand:
    name = name.strip()
    brand = db.scalar(select(Brand).where(func.lower(Brand.name) == name.lower()))
    if brand is None:
        brand = Brand(name=name)
        db.add(brand)
        db.flush()
    return brand


def get_or_create_mechanism_type(db: Session, name: str) -> MechanismType:
    name = name.strip()
    mechanism_type = db.scalar(
        select(MechanismType).where(func.lower(MechanismType.name) == name.lower())
    )
    if mechanism_type is None:
        mechanism_type = MechanismType(name=name)
        db.add(mechanism_type)
        db.flush()
    return mechanism_type


def get_or_create_attribute_value(db: Session, attribute_type: AttributeType, value: str) -> AttributeValue:
    value = value.strip()
    attribute_value = db.scalar(
        select(AttributeValue).where(
            AttributeValue.attribute_type_id == attribute_type.id,
            func.lower(AttributeValue.value) == value.lower(),
        )
    )
    if attribute_value is None:
        attribute_value = AttributeValue(attribute_type_id=attribute_type.id, value=value)
        db.add(attribute_value)
        db.flush()
    return attribute_value


def get_attribute_types_by_name(db: Session) -> dict[str, AttributeType]:
    attribute_types = db.execute(select(AttributeType)).scalars().all()
    return {attribute_type.name.strip().lower(): attribute_type for attribute_type in attribute_types}


def _assert_public_host(hostname: str) -> None:
    try:
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise ImageDownloadError(f"Не вдалося визначити адресу хоста «{hostname}»") from exc

    for info in infos:
        ip_obj = ipaddress.ip_address(info[4][0])
        if (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_link_local
            or ip_obj.is_multicast
            or ip_obj.is_reserved
            or ip_obj.is_unspecified
        ):
            raise ImageDownloadError(f"Заборонено завантажувати фото з приватної адреси ({hostname})")


def download_image_from_url(url: str) -> tuple[bytes, str]:
    """Завантажує фото за URL з файлу імпорту. Захист від SSRF: лише http/https,
    хост резолвиться і перевіряється на приватні/локальні адреси, редиректи заборонені,
    розмір і Content-Type перевіряються під час стрімінгу (не після повного завантаження)."""
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ImageDownloadError(f"Непідтримувана схема посилання на фото: {url}")
    if not parsed.hostname:
        raise ImageDownloadError(f"Некоректне посилання на фото: {url}")

    _assert_public_host(parsed.hostname)

    try:
        with httpx.stream("GET", url, timeout=10, follow_redirects=False) as response:
            if response.status_code >= 300:
                raise ImageDownloadError(f"Фото {url} недоступне (HTTP {response.status_code})")

            content_type = response.headers.get("content-type", "")
            if not content_type.startswith("image/"):
                raise ImageDownloadError(f"Посилання {url} не веде на зображення")

            chunks = bytearray()
            for chunk in response.iter_bytes():
                chunks.extend(chunk)
                if len(chunks) > MAX_IMAGE_DOWNLOAD_BYTES:
                    raise ImageDownloadError(f"Фото {url} завелике (більше 8 МБ)")
    except httpx.HTTPError as exc:
        raise ImageDownloadError(f"Не вдалося завантажити фото {url}: {exc}") from exc

    extension = IMAGE_CONTENT_TYPE_EXTENSIONS.get(content_type.split(";")[0].strip())
    if extension is None:
        extension = Path(parsed.path).suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise ImageDownloadError(f"Непідтримуваний формат фото: {url}")

    return bytes(chunks), extension


def _import_single_row(
    db: Session, row: dict[str, str], attribute_types_by_name: dict[str, AttributeType]
) -> tuple[Product, bool]:
    """Обробляє основні поля одного рядка (без фото). Повертає (товар, чи це було оновлення)."""
    name = row.get("Назва", "").strip()
    if not name:
        raise ValueError("Колонка «Назва» обов'язкова")

    sku = row.get("Артикул", "").strip()
    if not sku:
        raise ValueError("Колонка «Артикул» обов'язкова")

    price = parse_required_decimal(row.get("Ціна", ""), "Ціна")
    old_price = parse_optional_decimal(row.get("Стара_ціна", ""), "Стара_ціна")

    category_name = row.get("Категорія", "").strip()
    if not category_name:
        raise ValueError("Колонка «Категорія» обов'язкова")
    category = resolve_category(db, category_name)

    brand_name = row.get("Бренд", "").strip()
    if not brand_name:
        raise ValueError("Колонка «Бренд» обов'язкова")
    brand = get_or_create_brand(db, brand_name)

    mechanism_name = row.get("Тип_механізму", "").strip()
    if not mechanism_name:
        raise ValueError("Колонка «Тип_механізму» обов'язкова")
    mechanism_type = get_or_create_mechanism_type(db, mechanism_name)

    gender_value = row.get("Стать", "").strip()
    if not gender_value:
        raise ValueError("Колонка «Стать» обов'язкова")
    gender = parse_gender(gender_value)

    case_diameter_mm = parse_optional_int(row.get("Діаметр_мм", ""), "Діаметр_мм")
    case_thickness_mm = parse_optional_int(row.get("Товщина_мм", ""), "Товщина_мм")
    package_contents = row.get("Комплектація", "").strip() or None
    description = row.get("Опис", "").strip() or None
    is_active = parse_bool(row.get("Активний", ""), default=True)

    attribute_value_ids: list[int] = []
    for header, value in row.items():
        if header in FIXED_COLUMNS or not value.strip():
            continue
        attribute_type = attribute_types_by_name.get(header.strip().lower())
        if attribute_type is None:
            continue
        for piece in value.split(";"):
            piece = piece.strip()
            if not piece:
                continue
            attribute_value = get_or_create_attribute_value(db, attribute_type, piece)
            attribute_value_ids.append(attribute_value.id)

    payload_fields = dict(
        name=name,
        description=description,
        price=price,
        old_price=old_price,
        sku=sku,
        category_id=category.id,
        brand_id=brand.id,
        mechanism_type_id=mechanism_type.id,
        gender=gender,
        case_diameter_mm=case_diameter_mm,
        case_thickness_mm=case_thickness_mm,
        warranty_months=DEFAULT_WARRANTY_MONTHS,
        package_contents=package_contents,
        is_active=is_active,
        attribute_value_ids=attribute_value_ids,
    )

    # create_product/update_product комітять одразу — товар зберігається в базі
    # незалежно від того, чи вдасться потім довантажити фото. Помилку фото
    # обробляє окремий try/except у import_products, щоб не «відкочувати»
    # звіт про вже реально створений/оновлений товар.
    existing = get_product_by_sku(db, sku)
    if existing is not None:
        product: Product = update_product(db, existing.id, ProductUpdateRequest(**payload_fields))
        is_update = True
    else:
        product = create_product(db, ProductCreateRequest(**payload_fields))
        is_update = False

    return product, is_update


def _attach_import_photos(db: Session, product: Product, row: dict[str, str]) -> None:
    # Фото довантажуються лише якщо в товару їх ще немає — повторний імпорт того самого
    # файлу не плодить дублікати фото при кожному запуску.
    photo_value = row.get("Фото", "").strip()
    if not photo_value or product.images:
        return
    for url in photo_value.split(";"):
        url = url.strip()
        if not url:
            continue
        content, extension = download_image_from_url(url)
        add_product_image_from_bytes(db, product, extension, content)


def import_products(db: Session, rows: list[dict[str, str]]) -> ProductImportReport:
    attribute_types_by_name = get_attribute_types_by_name(db)
    created = 0
    updated = 0
    errors: list[ProductImportRowError] = []

    for index, row in enumerate(rows):
        spreadsheet_row = index + 2  # рядок 1 — заголовки, дані починаються з рядка 2
        try:
            product, is_update = _import_single_row(db, row, attribute_types_by_name)
        except Exception as exc:  # помилка в одному рядку не має зупиняти весь імпорт
            db.rollback()
            errors.append(ProductImportRowError(row=spreadsheet_row, message=str(exc)))
            continue

        try:
            _attach_import_photos(db, product, row)
        except (ImageDownloadError, InvalidImageError) as exc:
            # Товар уже створено/оновлено — рахуємо рядок успішним, але повідомляємо про фото окремо.
            db.rollback()
            errors.append(ProductImportRowError(row=spreadsheet_row, message=str(exc)))

        if is_update:
            updated += 1
        else:
            created += 1

    return ProductImportReport(total_rows=len(rows), created=created, updated=updated, errors=errors)


def build_import_template_csv(db: Session) -> str:
    attribute_types = db.execute(select(AttributeType).order_by(AttributeType.name)).scalars().all()
    headers = list(FIXED_COLUMNS_ORDER) + [attribute_type.name for attribute_type in attribute_types]

    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=headers)
    writer.writeheader()
    example_row = dict(TEMPLATE_EXAMPLE_ROW)
    for attribute_type in attribute_types:
        example_row.setdefault(attribute_type.name, "")
    writer.writerow(example_row)
    return "﻿" + buffer.getvalue()
