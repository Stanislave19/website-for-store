import csv
import io
from decimal import Decimal, InvalidOperation

import openpyxl
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.constants import Gender
from app.models.attributes import AttributeType, AttributeValue
from app.models.catalog import Brand, Category, MechanismType

ALLOWED_IMPORT_EXTENSIONS = {".csv", ".xlsx"}

# Фіксовані колонки товару. Будь-яка інша колонка з заголовком, що збігається
# з назвою наявного attribute_type, трактується як атрибут (EAV) — жодних змін
# коду не потрібно при додаванні нового типу атрибута в адмінці.
FIXED_COLUMNS = {
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
    "Гарантія_міс",
    "Комплектація",
    "Активний",
    "Фото",
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
