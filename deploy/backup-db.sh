#!/usr/bin/env bash
# 매일 새벽 PostgreSQL 백업
# 설치: sudo -u todohunter crontab -e
#   0 4 * * * /home/todohunter/todohunter-repo/todohunter-app/deploy/backup-db.sh
#
# 최근 14일 백업만 보관, 나머지 자동 삭제

set -euo pipefail

BACKUP_DIR="/home/todohunter/backups"
DB_NAME="todo_hunter"
DB_USER="todohunter"

# .env 에서 비밀번호 읽기
APP_DIR="/home/todohunter/todohunter-repo/todohunter-app"
if [[ -f "$APP_DIR/.env" ]]; then
  # DATABASE_URL 에서 비밀번호 추출 (postgresql://user:PASS@host:port/db)
  export PGPASSWORD=$(grep -oP 'postgresql://[^:]+:\K[^@]+' "$APP_DIR/.env" | head -1)
fi

if [[ -z "${PGPASSWORD:-}" ]]; then
  echo "❌ .env 에서 DB 비밀번호를 못 읽었습니다"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "▶ 백업 시작: $BACKUP_FILE"
pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"
echo "▶ 백업 완료: $(du -h "$BACKUP_FILE" | cut -f1)"

# 14일 이상 된 백업 삭제
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +14 -delete
echo "▶ 14일 이상 오래된 백업 정리 완료"

echo "▶ 현재 백업 목록:"
ls -lh "$BACKUP_DIR" | tail -10
