# Схема бази даних — MVP

> Технічна схема для Claude Code. Магазин годинників, модель дропшипінг. Підхід: атрибути-списки — окремі таблиці-довідники або EAV, ніколи не текст у товарі. Тип id — integer, автоінкремент (PK).

## Принципи

- **Довідники** (brands, categories, mechanism_types) — окремі таблиці; у товарі лежить `*_id`, не текст.
- **EAV** для решти атрибутів (матеріал, форма, скло, водозахист, колір циферблата, індикація, ремінець, версія тощо) — три таблиці замість десятка.
- **Гостьовий wishlist — у браузері (localStorage), НЕ в базі.** Таблиця `wishlist_items` — тільки для залогінених клієнтів.
- Оплати в MVP немає — жодних payment-полів і транзакцій.
- Окремого поля «в наявності» НЕМАЄ навмисно: у дропшипінгу товар завжди доступний. Видимістю в каталозі керує лише `products.is_active`.
- suppliers відсутній свідомо (немає структурованого джерела; дані заводяться імпортом Excel/CSV).

---

## Таблиці

### categories
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| name | string | назва категорії |
| parent_id | int FK → categories.id, nullable | самопосилання для підкатегорій; null = коренева |
| slug | string, unique | для URL і SEO |
| created_at | timestamp | |

### brands
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| name | string, unique | |

### mechanism_types
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| name | string, unique | кварц / механіка / автомат |

### products
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| name | string | |
| slug | string, unique, indexed | для SEO-URL картки товару (напр. casio-mtp-1234); генерується з назви + артикула ПРИ СТВОРЕННІ й НЕ змінюється автоматично при редагуванні назви (щоб не ламати проіндексовані Google-посилання). За потреби — окреме ручне редагування slug. |
| description | text | опис + характеристики, що не фільтруються (колір корпусу, покриття тощо) |
| price | decimal(10,2) | поточна ціна в грн |
| old_price | decimal(10,2), nullable | стара (перекреслена) ціна; null = без знижки |
| sku | string, unique | артикул |
| category_id | int FK → categories.id | обов'язковий |
| brand_id | int FK → brands.id | обов'язковий |
| mechanism_type_id | int FK → mechanism_types.id | обов'язковий |
| gender | enum | стать: `male` / `female` / `unisex` (обов'язковий) |
| case_diameter_mm | int, nullable | діаметр корпусу в мм; фільтр діапазонами (напр. 38-41) |
| case_thickness_mm | int, nullable | товщина корпусу в мм; окреме число (не EAV) за тим самим принципом, що діаметр — фільтр діапазоном (min/max), не список значень |
| warranty_months | int, nullable | термін гарантії в місяцях |
| package_contents | text, nullable | комплектація (коробка, документи, гарантійний талон тощо) |
| is_active | bool | показувати в каталозі |
| created_at | timestamp | для сортування «новинки» |

Обов'язкові при додаванні: name, price, sku, category_id, brand_id, mechanism_type_id, gender.
Діаметр — окреме число (не EAV), бо фільтрується діапазонами (порівняння чисел). Пресети діапазонів у фільтрі — **напіввідкриті інтервали, без перекриття**: до 33 · 34–38 · 39–41 · 42–43 · 44–45 · від 46 мм. (Не робити 21-33 / 33-38 — межа 33 потрапляла б у два фільтри одночасно.)

### product_images
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| product_id | int FK → products.id | |
| url | string | шлях до файлу |
| position | int | порядок; 0 = головне фото |

### attribute_types (EAV)
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| name | string, unique | «матеріал корпусу», «форма», «скло», «водозахист», «колір циферблата», «тип індикації», «тип ремінця», «версія», «функції», «тип індексів» |

### attribute_values (EAV)
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| attribute_type_id | int FK → attribute_types.id | |
| value | string | «Латунь», «Кругла», «Сапфірове», «Класика»... |

Унікальність пари (attribute_type_id, value) — щоб не було дублів значень.

### product_attributes (EAV зв'язок)
| Поле | Тип | Примітки |
|---|---|---|
| product_id | int FK → products.id | |
| attribute_value_id | int FK → attribute_values.id | |

Складений PK (product_id, attribute_value_id). Багато-до-багатьох.

### users
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| email | string, unique | |
| password_hash | string | |
| role | enum | `client` / `manager` / `owner` (гість акаунта не має) |
| phone | string, nullable | |
| two_factor_enabled | bool, default false | чи увімкнена 2FA. Використовується ВИКЛЮЧНО для role=owner; для клієнтів/менеджерів завжди false (не робити 2FA-форму клієнтам). |
| totp_secret | string, nullable | секрет для 2FA (TOTP); шифрується. Заповнюється лише для owner. |
| created_at | timestamp | |

### orders
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| user_id | int FK → users.id, nullable | null = замовлення гостя |
| first_name | string | ім'я отримувача (обов'язкове, потрібне для ТТН Нової Пошти) |
| last_name | string | прізвище отримувача (обов'язкове, потрібне для ТТН Нової Пошти) |
| phone | string | обов'язковий, валідація +380 |
| city | string | |
| city_ref | string, nullable | внутрішній Ref міста з API Нової Пошти (для точного визначення при створенні ТТН); заповнюється лише коли клієнт обрав місто з автопідказки на nova_poshta |
| delivery_method | enum | `nova_poshta` / `ukrposhta` / `courier` / `pickup` |
| np_office | string, nullable | відділення НП (текст); заповнюється лише для nova_poshta |
| warehouse_ref | string, nullable | внутрішній Ref відділення з API Нової Пошти; заповнюється лише коли клієнт обрав відділення з автопідказки |
| contact_method | enum | `call` / `telegram` / `viber` |
| comment | text, nullable | |
| status | enum | див. перелік статусів нижче |
| promo_code_id | int FK → promo_codes.id, nullable | |
| items_total | decimal(10,2) | сума товарів до знижки |
| discount_amount | decimal(10,2) | розмір знижки (0, якщо без промокоду) |
| total | decimal(10,2) | підсумок = items_total − discount_amount |
| created_at | timestamp | |

**Статуси замовлення (MVP):** `new` (нова) → `processing` (у обробці) → `confirmed` (підтверджена) → `shipped` (відправлена) → `completed` (виконана); окремо `cancelled` (скасована).

### order_items
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| order_id | int FK → orders.id | |
| product_id | int FK → products.id | |
| quantity | int | |
| price_at_order | decimal(10,2) | ціна на момент замовлення (історична) |

### wishlist_items
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| user_id | int FK → users.id | тільки залогінені; гостьовий wishlist — у браузері |
| product_id | int FK → products.id | |

Унікальність пари (user_id, product_id).

### saved_addresses
Збережені адреси доставки — тільки для залогінених клієнтів (зручність повторного замовлення).
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| user_id | int FK → users.id | |
| recipient_first_name | string | ім'я отримувача (для ТТН) |
| recipient_last_name | string | прізвище отримувача (для ТТН) |
| city | string | |
| delivery_method | enum | `nova_poshta` / `ukrposhta` / `courier` / `pickup` |
| np_office | string, nullable | лише для nova_poshta |
| is_default | bool | адреса за замовчуванням |

### promo_codes
| Поле | Тип | Примітки |
|---|---|---|
| id | int PK | |
| code | string, unique | |
| discount_type | enum | `percent` або `fixed` |
| discount_value | decimal(10,2) | % або сума в грн |
| expires_at | date, nullable | термін дії; null = безстроковий |
| usage_limit | int, nullable | макс. використань; null = без ліміту |
| usage_count | int, default 0 | скільки разів застосовано (для перевірки ліміту) |
| is_active | bool | |

### settings
Глобальні налаштування магазину (ключ-значення) — посилання на соцмережі, контакти месенджерів менеджера, увімкнені способи доставки тощо.
| Поле | Тип | Примітки |
|---|---|---|
| key | string PK | напр. `instagram_url`, `telegram_manager`, `viber_manager`, `facebook_url` |
| value | text | значення |

---

## Зв'язки (підсумок)

- categories → categories (parent_id, підкатегорії)
- categories → products (одна категорія, багато товарів)
- brands → products
- mechanism_types → products
- products → product_images (один товар, багато фото)
- products ↔ attribute_values через product_attributes (багато-до-багатьох)
- attribute_types → attribute_values
- users → orders (nullable: гість без user_id)
- orders → order_items → products
- users ↔ products через wishlist_items
- users → saved_addresses (збережені адреси клієнта)
- promo_codes → orders

---

## Внесені виправлення (чотири звірки)

Перша звірка:
1. `promo_codes.usage_count` — додано лічильник для перевірки ліміту.
2. Гостьовий wishlist — винесено в браузер; таблиця тільки для клієнтів.
3. Статуси замовлення — зафіксовано повний перелік.
4. Ціна замовлення — розділено на items_total / discount_amount / total.
5. `created_at` — додано в products і users (сортування, аналітика).
6. «Версія» (Fashion/Класика/Спорт/Дитячі) — заведено в EAV як attribute_type.

Друга звірка:
7. Діаметр корпусу — винесено з EAV в окреме число `case_diameter_mm` (фільтр діапазонами).
8. `products.old_price` — додано для знижки на товар (стара/нова ціна).
9. Enum-поля (gender, role, status, contact_method, discount_type) — обмежений набір значень замість вільного тексту.
10. Таблиця `settings` — для соцмереж, контактів месенджерів, налаштувань.

Третя звірка (проти специфікації MVP + предметна):
11. `orders.delivery_method` — додано; спосіб доставки раніше ніде не зберігався (діра проти специфікації).
12. Таблиця `saved_addresses` — збережені адреси клієнта (специфікація обіцяла, схема не мала).
13. `np_office` — зроблено nullable (заповнюється лише для Нової Пошти).
14. Явно зафіксовано відсутність поля «наявності» (дропшипінг; керує is_active).
15. `warranty_months` + `package_contents` — гарантія й комплектація (предметна вимога торгівлі годинниками).
16. Водозахист — лишається в EAV списком (рішення: без діапазонного фільтра). Стан товару — поля немає (тільки нові).

Четверта звірка (аудит Claude Code):
17. `products.slug` — додано (був блокер: API і фронт адресували товар за slug, а поля не було).
18. `users.two_factor_enabled` + `totp_secret` — місце під 2FA власника (вимога була в специфікації, місця в схемі не було).

П'ята звірка (уточнення користувача):
19. `orders.customer_name` розділено на `first_name` + `last_name` — Нова Пошта вимагає окремо ім'я і прізвище для ТТН. Так само `recipient_first_name` + `recipient_last_name` у saved_addresses.

Шоста звірка (інтеграція автопідказок Нової Пошти):
20. `orders.city_ref` + `orders.warehouse_ref` — внутрішні ідентифікатори (Ref) міста й відділення з API Нової Пошти, поруч із текстовими `city`/`np_office`. Обоє nullable, заповнюються лише коли клієнт обрав варіант з автопідказки (не при ручному введенні тексту чи для інших способів доставки). Мета — точність при створенні ТТН менеджером, без потреби вручну шукати відділення в кабінеті НП. У `saved_addresses` поки НЕ додано (кабінет клієнта зі збереженими адресами ще не будувався).

Сьома звірка (дослідження реальних магазинів годинників — Chrono24, eBay-лістинги):
21. `products.case_thickness_mm` — товщина корпусу в мм, за тим самим принципом, що `case_diameter_mm`: окреме число, не EAV, бо потенційно фільтрується діапазоном.
22. Нові `attribute_types`: «Функції» (множинний вибір — товар може мати кілька значень одночасно: Хронограф, Дата, Будильник, Індикатор запасу ходу, Компас, Таймер) і «Тип індексів» (Арабські цифри, Римські цифри, Рисочки/палички, Без цифр). Технічно нічого нового в схемі не знадобилось — `product_attributes` вже багато-до-багатьох, підтримує кілька значень на товар для будь-якого типу атрибута.

---

## Не входить у MVP (додається в прод)

- payment_status, транзакції LiqPay, передоплата
- будь-які поля, пов'язані з онлайн-оплатою
