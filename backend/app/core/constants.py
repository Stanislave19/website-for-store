import enum


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    unisex = "unisex"


class UserRole(str, enum.Enum):
    client = "client"
    manager = "manager"
    owner = "owner"


class OrderStatus(str, enum.Enum):
    new = "new"
    processing = "processing"
    confirmed = "confirmed"
    shipped = "shipped"
    completed = "completed"
    cancelled = "cancelled"


class DeliveryMethod(str, enum.Enum):
    nova_poshta = "nova_poshta"
    ukrposhta = "ukrposhta"
    courier = "courier"
    pickup = "pickup"


class ContactMethod(str, enum.Enum):
    call = "call"
    telegram = "telegram"
    viber = "viber"


class DiscountType(str, enum.Enum):
    percent = "percent"
    fixed = "fixed"
