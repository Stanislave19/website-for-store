import logging
from dataclasses import dataclass

import httpx

from app.config import settings
from app.core.constants import ContactMethod, DeliveryMethod

logger = logging.getLogger(__name__)

DELIVERY_LABELS = {
    DeliveryMethod.nova_poshta: "Нова Пошта",
    DeliveryMethod.ukrposhta: "Укрпошта",
    DeliveryMethod.courier: "Кур'єр",
    DeliveryMethod.pickup: "Самовивіз",
}

CONTACT_LABELS = {
    ContactMethod.call: "Дзвінок",
    ContactMethod.telegram: "Telegram",
    ContactMethod.viber: "Viber",
}


@dataclass
class OrderNotificationItem:
    name: str
    sku: str
    price: float
    quantity: int


@dataclass
class OrderNotificationData:
    order_id: int
    first_name: str
    last_name: str
    phone: str
    city: str | None
    delivery_method: DeliveryMethod
    np_office: str | None
    contact_method: ContactMethod
    comment: str | None
    items_total: float
    discount_amount: float
    total: float
    items: list[OrderNotificationItem]


def _build_message(data: OrderNotificationData) -> str:
    lines = [f"Нова заявка №{data.order_id}", ""]

    for item in data.items:
        line = f"• {item.name} (арт. {item.sku}) — {item.price:.0f} ₴"
        if item.quantity > 1:
            line += f" × {item.quantity}"
        lines.append(line)

    lines.append("")
    if data.discount_amount:
        lines.append(f"Сума: {data.total:.0f} ₴ (знижка {data.discount_amount:.0f} ₴)")
    else:
        lines.append(f"Сума: {data.total:.0f} ₴")

    lines.append("")
    lines.append(f"Ім'я: {data.first_name} {data.last_name}")
    lines.append(f"Телефон: {data.phone}")
    if data.city:
        lines.append(f"Місто: {data.city}")
    lines.append(f"Доставка: {DELIVERY_LABELS.get(data.delivery_method, data.delivery_method)}")
    if data.np_office:
        lines.append(f"Відділення: {data.np_office}")
    lines.append(f"Зв'язок: {CONTACT_LABELS.get(data.contact_method, data.contact_method)}")
    if data.comment:
        lines.append(f"Коментар: {data.comment}")

    return "\n".join(lines)


def send_order_notification(data: OrderNotificationData) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.warning(
            "Telegram-сповіщення для заявки №%s пропущено: TELEGRAM_BOT_TOKEN або "
            "TELEGRAM_CHAT_ID не задані в .env",
            data.order_id,
        )
        return

    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"

    try:
        response = httpx.post(
            url,
            json={"chat_id": settings.telegram_chat_id, "text": _build_message(data)},
            timeout=10,
        )
        if response.status_code != 200:
            logger.error(
                "Telegram API повернув помилку для заявки №%s: код %s",
                data.order_id,
                response.status_code,
            )
    except httpx.HTTPError as exc:
        logger.error(
            "Не вдалося надіслати Telegram-сповіщення для заявки №%s: %s",
            data.order_id,
            type(exc).__name__,
        )
