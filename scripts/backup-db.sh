#!/usr/bin/env bash
# Резервна копія бази PostgreSQL і фото товарів (media_data) через docker compose.
#
# Запуск вручну (з кореня проєкту): ./scripts/backup-db.sh
# Зберігається два файли:
#   backups/backup-РІК-МІСЯЦЬ-ДЕНЬ-ГОДИНА-ХВИЛИНА-СЕКУНДА.sql       — дамп бази
#   backups/media-РІК-МІСЯЦЬ-ДЕНЬ-ГОДИНА-ХВИЛИНА-СЕКУНДА.tar.gz     — фото товарів
# (backups/ у .gitignore — не мають потрапляти в git).
#
# Автоматичний запуск на сервері (щоночі о 3:00), додати в crontab (crontab -e):
#   0 3 * * * /повний/шлях/до/website-for-store/scripts/backup-db.sh >> /var/log/lerom-backup.log 2>&1
#
# Відновлення з дампу — див. docs/disaster-recovery.md (повний сценарій
# відновлення сервера з нуля). Коротко:
#   docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backups/backup-....sql
#   docker compose exec -T backend tar xzf - -C /app/media < backups/media-....tar.gz

set -euo pipefail

cd "$(dirname "$0")/.."

set -a
source .env
set +a

mkdir -p backups

timestamp=$(date +%Y%m%d-%H%M%S)
backup_file="backups/backup-${timestamp}.sql"
media_file="backups/media-${timestamp}.tar.gz"

docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$backup_file"
echo "Резервну копію бази збережено: $backup_file"

docker compose exec -T backend tar czf - -C /app/media . > "$media_file"
echo "Резервну копію фото збережено: $media_file"

# Ротація: видалити дампи старші за 14 днів, щоб не заповнювати диск нескінченно.
find backups -name "backup-*.sql" -mtime +14 -delete
find backups -name "media-*.tar.gz" -mtime +14 -delete
