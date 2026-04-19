#!/usr/bin/env bash
# PostgreSQL 초기 DB/유저 생성
# 실행: sudo bash setup-postgres.sh
#
# 생성되는 것:
#   - DB role: todohunter
#   - DB name: todo_hunter
#   - 권한: todohunter 유저는 todo_hunter DB에서 모든 작업 가능
#   - DATABASE_URL 문자열 출력 (GitHub Secret에 등록용)

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "❌ sudo 권한으로 실행하세요"
  exit 1
fi

DB_USER="todohunter"
DB_NAME="todo_hunter"

# 비밀번호 입력 (에코 없음)
read -rsp "DB 유저($DB_USER) 비밀번호 설정: " DB_PASS
echo ""
read -rsp "비밀번호 한 번 더: " DB_PASS_CONFIRM
echo ""

if [[ "$DB_PASS" != "$DB_PASS_CONFIRM" ]]; then
  echo "❌ 비밀번호가 일치하지 않습니다"
  exit 1
fi

if [[ ${#DB_PASS} -lt 12 ]]; then
  echo "⚠️  비밀번호가 너무 짧습니다 (최소 12자 권장)"
  read -rp "그래도 진행? (y/N): " yn
  [[ "$yn" != "y" ]] && exit 1
fi

# postgres 슈퍼유저로 실행
sudo -u postgres psql <<EOF
-- 기존 role 있으면 비밀번호만 업데이트
DO \$\$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
    ALTER USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
    RAISE NOTICE 'User $DB_USER exists, password updated';
  ELSE
    CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
    RAISE NOTICE 'User $DB_USER created';
  END IF;
END
\$\$;

-- DB 없으면 생성
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- 권한 재확인
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
EOF

echo ""
echo "✅ PostgreSQL 세팅 완료"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "GitHub Secrets 등록용 DATABASE_URL:"
echo ""
echo "  postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "위 문자열을 복사해서 GitHub → Settings → Secrets and variables"
echo "→ Actions → DATABASE_URL 에 등록하세요."
echo ""
echo "연결 테스트:"
echo "  PGPASSWORD='$DB_PASS' psql -h localhost -U $DB_USER -d $DB_NAME -c '\\dt'"
echo ""
