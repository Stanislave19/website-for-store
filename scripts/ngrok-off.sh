#!/usr/bin/env bash
# Повертає локальний сайт зі "ngrok-режиму" (./scripts/ngrok-on.sh) назад
# у звичайний локальний.
#
# Запуск (з кореня проєкту): ./scripts/ngrok-off.sh
#
# Що робить:
#   1. Відновлює .env із .env.ngrok-backup (реальний стан до ngrok-on.sh,
#      не якесь "типове" захардкоджене значення).
#   2. Прибирає allowedDevOrigins із frontend/next.config.ts.
#   3. Перезапускає frontend-контейнер.

set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.ngrok-backup ]; then
  echo "Резервної копії .env.ngrok-backup не знайдено — схоже, тунель-режим"
  echo "не був увімкнений через ./scripts/ngrok-on.sh (або вже вимкнений раніше)."
  echo "Нічого не змінюю."
  exit 1
fi

cp .env.ngrok-backup .env
rm .env.ngrok-backup
echo ".env відновлено з резервної копії"

CONFIG_FILE="frontend/next.config.ts"
if grep -q "allowedDevOrigins" "$CONFIG_FILE"; then
  sed -i '/allowedDevOrigins/d' "$CONFIG_FILE"
  echo "allowedDevOrigins прибрано з next.config.ts"
else
  echo "allowedDevOrigins і так немає в next.config.ts"
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
echo "Повернуто до локального режиму"
