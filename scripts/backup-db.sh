#!/usr/bin/env bash
# Резервна копія бази PostgreSQL через docker compose.
#
# Запуск вручну (з кореня проєкту): ./scripts/backup-db.sh
# Дамп зберігається в backups/backup-РІК-МІСЯЦЬ-ДЕНЬ-ГОДИНА-ХВИЛИНА-СЕКУНДА.sql
# (backups/ у .gitignore — дампи бази не мають потрапляти в git).
#
# Автоматичний запуск на сервері (щоночі о 3:00), додати в crontab (crontab -e):
#   0 3 * * * /повний/шлях/до/website-for-store/scripts/backup-db.sh >> /var/log/lerom-backup.log 2>&1
#
# Відновлення з дампу:
#   docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backups/backup-....sql

set -euo pipefail

cd "$(dirname "$0")/.."

set -a
source .env
set +a

mkdir -p backups

timestamp=$(date +%Y%m%d-%H%M%S)
backup_file="backups/backup-${timestamp}.sql"

docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$backup_file"

echo "Резервну копію збережено: $backup_file"

# Ротація: видалити дампи старші за 14 днів, щоб не заповнювати диск нескінченно.
find backups -name "backup-*.sql" -mtime +14 -delete
