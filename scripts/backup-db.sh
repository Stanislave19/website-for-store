#!/usr/bin/env bash
# Резервна копія бази PostgreSQL і фото товарів (media_data) через docker compose,
# з копіюванням поза сервер (щоб бекапи не загинули разом із сервером).
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
# Відновлення — див. docs/disaster-recovery.md (повний сценарій відновлення
# сервера з нуля, включно з тим, звідки взяти бекапи, якщо сервер втрачено).
#
# --- Офсайт-копія (Backblaze B2 через rclone) ---
# Одноразове налаштування на сервері:
#   curl https://rclone.org/install.sh | sudo bash
#   rclone config
#     -> n (new remote) -> назва "b2backup" -> тип "b2"
#     -> Account ID і Application Key беруться в кабінеті Backblaze
#        (backblaze.com -> App Keys -> Add a New Application Key)
#     -> решта полів за замовчуванням
#   Створити бакет заздалегідь у кабінеті Backblaze (напр. "lerom-backups").
# Якщо rclone не встановлено або remote не налаштовано — скрипт лише попереджає
# в лог, локальні бекапи все одно створюються (офсайт-копія не блокує основну
# функцію скрипта).
OFFSITE_REMOTE="${OFFSITE_REMOTE:-b2backup:lerom-backups}"

set -euo pipefail

cd "$(dirname "$0")/.."

set -a
source .env
set +a

mkdir -p backups

timestamp=$(date +%Y%m%d-%H%M%S)
backup_file="backups/backup-${timestamp}.sql"
media_file="backups/media-${timestamp}.tar.gz"

# pg_dump пишеться у тимчасовий файл і перейменовується у фінальну назву лише
# після успішного завершення — щоб збій (диск повний, база лягла, обірваний
# docker exec) не лишав биту/неповну копію під виглядом готового бекапу.
if docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "${backup_file}.tmp"; then
    mv "${backup_file}.tmp" "$backup_file"
    echo "Резервну копію бази збережено: $backup_file"
else
    rm -f "${backup_file}.tmp"
    echo "ПОМИЛКА: pg_dump не вдався, резервну копію бази НЕ збережено" >&2
    exit 1
fi

if docker compose exec -T backend tar czf - -C /app/media . > "${media_file}.tmp"; then
    mv "${media_file}.tmp" "$media_file"
    echo "Резервну копію фото збережено: $media_file"
else
    rm -f "${media_file}.tmp"
    echo "ПОМИЛКА: архівування фото не вдалося, резервну копію фото НЕ збережено" >&2
    exit 1
fi

# Ротація: видалити локальні копії старші за 14 днів, щоб не заповнювати диск нескінченно.
find backups -name "backup-*.sql" -mtime +14 -delete
find backups -name "media-*.tar.gz" -mtime +14 -delete

# Копія поза сервер — щоб бекапи пережили втрату самого сервера, а не лише
# втрату бази на ньому. Некритична помилка: якщо мережа/сховище недоступні,
# локальний бекап цієї ночі все одно є, просто попереджаємо в лог.
if command -v rclone >/dev/null 2>&1; then
    if rclone copy backups/ "$OFFSITE_REMOTE"; then
        echo "Бекапи скопійовано в офсайт-сховище: $OFFSITE_REMOTE"
    else
        echo "УВАГА: не вдалося скопіювати бекапи в офсайт-сховище ($OFFSITE_REMOTE)" >&2
    fi
else
    echo "УВАГА: rclone не встановлено — бекапи лишаються лише локально на сервері" >&2
fi
