# Структура папок проєкту

> Як організований код. Два окремі проєкти (backend + frontend) в одному репозиторії, плюс Docker і документація. Структура збалансована: розділена на шари, але без надлишкової складності. Розрахована на MVP із запасом на прод.

## Верхній рівень

```
website-for-the-store/
├── CLAUDE.md              # навігатор для Claude Code (правила, стек, посилання)
├── docker-compose.yml     # піднімає все разом: backend, frontend, db, nginx
├── .env.example           # приклад змінних оточення (без реальних секретів)
├── .gitignore
├── docs/                  # уся проєктна документація
│   ├── idea.md
│   ├── specyfikaciya-mvp.md
│   ├── specyfikaciya-prod.md
│   ├── database-schema-mvp.md
│   ├── database-schema-prod.md
│   ├── api-endpoints-mvp.md
│   ├── api-endpoints-prod.md
│   ├── project-structure.md
│   ├── development-order.md
│   ├── design-system.md        # палітра, шрифти, компоненти
│   ├── page-home.md            # специфікації сторінок
│   ├── page-catalog.md
│   ├── page-product.md
│   ├── page-cart.md
│   ├── page-checkout.md
│   └── design/                 # скріншоти макетів (референси)
│       ├── home-1.png … home-4.png
│       ├── catalog-1.png … catalog-3.png
│       ├── product-1.png … product-4.png
│       ├── cart-1.png … cart-3.png
│       └── checkout-1.png … checkout-3.png
├── backend/               # FastAPI (Python)
├── frontend/              # Next.js (React)
└── nginx/                 # конфіг веб-сервера (маршрутизація запитів)
```

---

## Backend (FastAPI)

```
backend/
├── Dockerfile
├── requirements.txt        # або pyproject.toml — залежності Python
├── alembic.ini             # конфіг міграцій
├── alembic/                # міграції бази (версії схеми)
│   └── versions/
├── app/
│   ├── main.py             # точка входу: створення застосунку, підключення роутерів, CORS
│   ├── config.py           # налаштування з .env (DATABASE_URL, секрети, ключі)
│   ├── database.py         # підключення до PostgreSQL, сесії
│   ├── dependencies.py     # спільні залежності (сесія БД, перевірка токена)
│   │
│   ├── models/             # SQLAlchemy-моделі (таблиці БД), розбиті по темах
│   │   ├── base.py         # базовий клас усіх моделей
│   │   ├── catalog.py      # products, categories, brands, mechanism_types, images
│   │   ├── attributes.py   # attribute_types, attribute_values, product_attributes
│   │   ├── orders.py       # orders, order_items
│   │   ├── users.py        # users, wishlist_items, saved_addresses
│   │   └── shop.py         # promo_codes, settings
│   │
│   ├── schemas/            # Pydantic-схеми (валідація вхідних/вихідних даних)
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── user.py
│   │   └── ...             # по одному файлу на тему, дзеркалить models
│   │
│   ├── services/           # бізнес-логіка (НЕ в роутерах!)
│   │   ├── product_service.py    # фільтри, пошук, вибірка каталогу
│   │   ├── order_service.py      # створення заявки, підрахунок суми
│   │   ├── promo_service.py      # перевірка промокоду
│   │   ├── import_service.py     # масовий імпорт Excel/CSV
│   │   └── telegram_service.py   # сповіщення менеджеру
│   │
│   ├── api/                # роутери (HTTP-ендпоінти)
│   │   ├── router.py       # збирає всі роутери разом
│   │   ├── public/         # публічні (вітрина)
│   │   │   ├── products.py
│   │   │   ├── catalog.py       # категорії, фільтри
│   │   │   ├── orders.py
│   │   │   ├── wishlist.py
│   │   │   ├── auth.py
│   │   │   └── settings.py
│   │   └── admin/          # захищені (адмінка)
│   │       ├── products.py
│   │       ├── categories.py
│   │       ├── attributes.py
│   │       ├── orders.py
│   │       ├── promo.py
│   │       ├── settings.py
│   │       └── auth.py
│   │
│   └── core/               # системне
│       ├── security.py     # хешування паролів, JWT-токени
│       └── constants.py    # enum-значення (статуси, ролі, способи доставки)
│
├── media/                  # завантажені фото товарів (або окремий том у Docker)
└── tests/                  # тести (дзеркалять структуру app)
```

**Логіка шарів (важливо для розуміння, де що шукати):**
- `models/` — як дані виглядають у базі (таблиці)
- `schemas/` — як дані приходять і йдуть через API (валідація)
- `services/` — що система робить із даними (уся логіка)
- `api/` — які адреси це віддають (тонкий шар, лише приймає запит → кличе сервіс → віддає відповідь)

Прод додасть сюди: `models/payments.py`, `services/payment_service.py`, `api/public/payments.py` — без переробки наявного.

---

## Frontend (Next.js)

```
frontend/
├── Dockerfile
├── package.json            # залежності + команди (dev, build)
├── next.config.js
├── tailwind.config.js
├── public/                 # статика (лого, іконки)
└── src/
    ├── app/                # сторінки (Next.js App Router)
    │   ├── layout.tsx      # спільний каркас (шапка, футер)
    │   ├── page.tsx        # головна
    │   ├── catalog/        # каталог із фільтрами
    │   │   └── page.tsx
    │   ├── about/          # Про нас (статична)
    │   ├── warranty/       # Гарантія (статична)
    │   ├── contacts/       # Контакти (статична)
    │   ├── product/
    │   │   └── [slug]/     # картка товару (динамічна за slug — для SEO)
    │   │       └── page.tsx
    │   ├── cart/           # кошик
    │   ├── wishlist/       # список бажань
    │   ├── checkout/       # оформлення заявки
    │   ├── order-success/  # екран-підтвердження
    │   ├── account/        # кабінет клієнта (історія, адреси)
    │   └── admin/          # адмінка (окрема зона)
    │       ├── products/
    │       ├── categories/
    │       ├── orders/
    │       └── promo/
    │
    ├── components/         # багаторазові компоненти інтерфейсу
    │   ├── ui/             # базові (кнопки, інпути, картки)
    │   ├── catalog/        # ProductCard, FilterPanel, SortDropdown
    │   ├── cart/           # CartItem, CartSummary
    │   └── layout/         # Header, Footer, SocialLinks, MessengerButtons
    │
    ├── lib/                # утиліти
    │   ├── api.ts          # функції звернень до бекенду
    │   └── validators.ts   # валідація форм (телефон +380 тощо)
    │
    ├── hooks/              # React-хуки (useCart, useWishlist — на localStorage)
    └── types/              # TypeScript-типи (Product, Order, Category)
```

**Ключове для SEO (твій пріоритет):**
- Сторінки товарів і каталогу — серверний рендеринг (Next.js робить це за замовчуванням у App Router), щоб Google бачив повний контент.
- Динамічний маршрут `product/[slug]` — гарні адреси з назвою моделі.
- `layout.tsx` — місце для спільних мета-тегів; окремі сторінки додають свої.

---

## Nginx

```
nginx/
└── default.conf            # маршрутизація: / → frontend, /api → backend, /media → фото
```

Nginx стоїть спереду й розподіляє запити: сторінки йдуть на Next.js, `/api/*` — на FastAPI, фото віддаються напряму. Це також місце для HTTPS-сертифіката.

---

## Чому саме так

- **Розділення backend / frontend** — дві незалежні частини, легко зрозуміти, де помилка (одне з головних для оператора).
- **Шари в бекенді** (models / schemas / services / api) — бізнес-логіка не змішана з HTTP; коли щось ламається, видно на якому рівні.
- **Моделі розбиті по темах** (не один величезний файл) — рекомендація для 10+ таблиць; у нас 14.
- **Публічні й адмін-роутери розділені** — та сама безпекова вимога про розділення зон.
- **Docker обгортає все** — незалежність від сервера, який ще не обрано.
- **Структура з запасом на прод** — оплата додається новими файлами, наявне не переробляється.
```
