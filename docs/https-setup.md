# Налаштування HTTPS (виконати після появи домену й сервера)

> MVP зараз працює по HTTP (порт 80) — це нормально для локальної розробки. Цей документ — покроковий чек-лист, коли буде реальний домен і сервер. До того часу нічого тут виконувати не треба.

## Чому зараз немає готового 443-блока в конфігу

`nginx/default.conf` навмисно **не** містить блок `listen 443 ssl` із `ssl_certificate`. Якщо вказати шлях до сертифіката, якого ще не існує, nginx не запуститься взагалі — впаде весь стек, включно з робочим HTTP. Тому конфіг лишається чистим HTTP, а сертифікат додається лише тоді, коли він фізично існує.

Що вже підготовлено зараз (не чекаючи домену):
- `location /.well-known/acme-challenge/` в `nginx/default.conf` — потрібен для підтвердження володіння доменом через Let's Encrypt (HTTP-01), нешкідливий без сертифіката.

## Кроки, коли буде домен і сервер

### 1. DNS
Направити A-запис домену (напр. `lerom.com.ua`) на IP сервера.

### 2. Отримати сертифікат через Certbot
На сервері, де вже піднятий `docker-compose up` (з nginx на порту 80, DNS уже вказує на сервер):

```bash
mkdir -p certbot/www certbot/conf
docker run --rm \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d lerom.com.ua -d www.lerom.com.ua \
  --email you@example.com --agree-tos --no-eff-email
```

Сертифікати з'являться в `certbot/conf/live/lerom.com.ua/`.

### 3. Домонтувати шлях у docker-compose.yml
У сервіс `nginx`:
```yaml
  nginx:
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - media_data:/media:ro
      - ./certbot/www:/var/www/certbot:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
```

### 4. Додати 443-блок і редирект у nginx/default.conf
Дописати поруч із наявним `server { listen 80; ... }` (сам блок 80 лишити — потрібен для ACME-challenge й редиректу):

```nginx
server {
    listen 80;
    server_name lerom.com.ua www.lerom.com.ua;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name lerom.com.ua www.lerom.com.ua;

    ssl_certificate     /etc/letsencrypt/live/lerom.com.ua/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lerom.com.ua/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    client_max_body_size 20M;

    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /media/ {
        alias /media/;
    }

    location / {
        proxy_pass http://frontend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Оновити .env
```
NEXT_PUBLIC_SITE_URL=https://lerom.com.ua
NEXT_PUBLIC_API_URL=https://lerom.com.ua/api
BACKEND_CORS_ORIGINS=https://lerom.com.ua
```

### 6. Перезапустити
```bash
docker compose up -d --build
```

### 7. Автопродовження сертифіката
Сертифікат Let's Encrypt діє 90 днів. Додати в crontab сервера (перевірка й оновлення раз на день, оновлює лише якщо термін спливає):
```
0 4 * * * cd /шлях/до/website-for-store && docker run --rm -v "$(pwd)/certbot/www:/var/www/certbot" -v "$(pwd)/certbot/conf:/etc/letsencrypt" certbot/certbot renew --webroot -w /var/www/certbot && docker compose exec nginx nginx -s reload
```

## Перевірка після налаштування
- `https://lerom.com.ua` відкривається без попереджень браузера про сертифікат.
- `http://lerom.com.ua` автоматично редиректить на `https://`.
- `https://www.ssllabs.com/ssltest/` — оцінка A або вище.
