# Схема бази даних — Прод (повна версія)

> Будується поверх MVP-схеми (`database-schema-mvp.md`). Усі таблиці MVP лишаються без змін. Цей документ описує ТІЛЬКИ те, що додається або змінюється для онлайн-оплати LiqPay.

## Що змінюється в існуючих таблицях

### orders — додаються поля
| Поле | Тип | Примітки |
|---|---|---|
| payment_method | enum | `cod` (наложка) / `cod_prepay` (наложка з передоплатою 150 грн) / `online` (повна онлайн-оплата) |
| payment_status | enum | `unpaid` / `paid` / `refunded` |
| paid_amount | decimal(10,2), default 0 | реально сплачено (повна сума або 150 грн передоплати) |

### orders — розширюється enum статусу
До MVP-статусів (`new`, `processing`, `confirmed`, `shipped`, `completed`, `cancelled`) додаються:
- `awaiting_payment` — створено, чекає оплати онлайн
- `awaiting_confirmation` — оплата пройшла, чекає перевірки наявності в постачальника
- `refunded` — кошти повернено

---

## Нова таблиця

### payment_transactions
Історія платіжних операцій LiqPay (для аудиту, звірки, повернень). Одне замовлення може мати кілька записів (оплата, потім повернення).
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| order_id | int FK → orders.id | |
| liqpay_order_id | string, unique | ідентифікатор операції на боці LiqPay |
| type | enum | `payment` / `refund` |
| amount | decimal(10,2) | сума операції |
| status | string | статус від LiqPay (success, failure, reversed тощо) |
| raw_response | text | повна відповідь LiqPay (для аудиту) |
| created_at | timestamp | |

---

## Зв'язки (доповнення)

- orders → payment_transactions (одне замовлення, багато операцій)

---

## Безпека платіжних даних

- Ключі LiqPay (public + private) — НЕ в базі й НЕ в коді, а в захищених змінних оточення.
- Дані карток у базі НЕ зберігаються ніколи (їх обробляє тільки LiqPay).
- `payment_transactions.raw_response` може містити чутливі метадані — доступ лише для owner.
- Підпис кожного вебхука перевіряється перед будь-якою зміною статусу.

---

## Що НЕ змінюється

Усі каталожні таблиці (products, categories, brands, mechanism_types, attribute_*, product_*), users, order_items, wishlist_items, saved_addresses, promo_codes, settings — лишаються точно як у MVP-схемі.
