#!/usr/bin/env bash
# Тимчасово перемикає локальний сайт у режим для тунелю ngrok.
#
# Запуск (з кореня проєкту): ./scripts/ngrok-on.sh
# Далі: ngrok http 80
# Повернення до звичайного локального режиму: ./scripts/ngrok-off.sh
#
# Що робить:
#   1. Робить резервну копію .env у .env.ngrok-backup (не в git).
#   2. Ставить NEXT_PUBLIC_API_URL=/api — відносний шлях, щоб браузер
#      телефону стукався в API через той самий ngrok-домен, а не в
#      localhost:8000, якого на телефоні немає.
#   3. Додає allowedDevOrigins у frontend/next.config.ts — без цього
#      dev-сервер Next.js блокує запити з чужого (ngrok) origin.
#   4. Перезапускає frontend-контейнер, щоб підхопив обидві зміни.

set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.ngrok-backup ]; then
  echo "Схоже, тунель-режим уже увімкнено — знайдено .env.ngrok-backup."
  echo "Спершу виконай ./scripts/ngrok-off.sh, якщо хочеш почати заново."
  exit 1
fi

cp .env .env.ngrok-backup
echo "Резервну копію .env збережено в .env.ngrok-backup"

sed -i 's|^NEXT_PUBLIC_API_URL=.*$|NEXT_PUBLIC_API_URL=/api|' .env
echo "NEXT_PUBLIC_API_URL у .env → /api"

CONFIG_FILE="frontend/next.config.ts"
if grep -q "allowedDevOrigins" "$CONFIG_FILE"; then
  echo "allowedDevOrigins уже є в next.config.ts — не чіпаю"
else
  sed -i 's|const nextConfig: NextConfig = {|const nextConfig: NextConfig = {\n  allowedDevOrigins: ["*.ngrok-free.app"],|' "$CONFIG_FILE"
  echo "Додано allowedDevOrigins у next.config.ts"
fi

echo "Перезапускаю frontend..."
docker compose restart frontend >/dev/null

echo -n "Чекаю, поки frontend підніметься"
for _ in $(seq 1 30); do
  if curl -sf http://localhost:3000/ >/dev/null 2>&1; then
    echo " — готово"
    break
  fi
  echo -n "."
  sleep 1
done

echo ""
echo "Тепер виконай: ngrok http 80"
