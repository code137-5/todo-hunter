#!/usr/bin/env bash
# Ubuntu 22.04/24.04 홈서버 초기 세팅 (1회 실행)
# 실행: sudo bash setup-server.sh
#
# 이 스크립트가 하는 일:
#   - 시스템 업데이트
#   - Node.js 20 LTS 설치
#   - PostgreSQL 설치
#   - Redis 설치 (Upstash 대신 로컬 사용 권장)
#   - Nginx 설치
#   - certbot 설치 (HTTPS용)
#   - ufw 방화벽 설정 (22/80/443만 허용)
#   - 서비스용 todohunter 유저 생성
#   - PM2 전역 설치
#   - 기본 디렉토리 구조 생성

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "❌ sudo 권한으로 실행하세요: sudo bash $0"
  exit 1
fi

echo "▶ 1/10 시스템 업데이트"
apt-get update
apt-get upgrade -y

echo "▶ 2/10 기본 도구 설치"
apt-get install -y curl wget git build-essential ca-certificates gnupg ufw

echo "▶ 3/10 Node.js 20 LTS 설치"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "   node: $(node -v)  npm: $(npm -v)"

echo "▶ 4/10 PM2 전역 설치"
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi
echo "   pm2: $(pm2 -v)"

echo "▶ 5/10 PostgreSQL 설치"
apt-get install -y postgresql postgresql-contrib
systemctl enable --now postgresql
echo "   postgres: $(sudo -u postgres psql -t -c 'SELECT version();' | head -1 | xargs)"

echo "▶ 6/10 Redis 설치 (로컬 사용)"
apt-get install -y redis-server
# bind to localhost only (보안)
sed -i 's/^# *bind .*/bind 127.0.0.1 ::1/' /etc/redis/redis.conf
sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
systemctl enable --now redis-server
systemctl restart redis-server
echo "   redis: $(redis-cli ping)"

echo "▶ 7/10 Nginx + certbot 설치"
apt-get install -y nginx certbot python3-certbot-nginx
systemctl enable --now nginx

echo "▶ 8/10 방화벽(ufw) 설정"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH (내부망만 공유기에서 포워딩 금지)'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
ufw status verbose

echo "▶ 9/10 todohunter 서비스 유저 생성"
if ! id todohunter &> /dev/null; then
  useradd -m -s /bin/bash todohunter
  echo "   유저 'todohunter' 생성됨"
else
  echo "   유저 'todohunter' 이미 존재"
fi

# 배포 디렉토리
sudo -u todohunter mkdir -p /home/todohunter/todohunter-repo/todohunter-app
sudo -u todohunter mkdir -p /home/todohunter/logs
sudo -u todohunter mkdir -p /home/todohunter/backups

echo "▶ 10/10 PM2 자동 시작 등록 (부팅 시 PM2 복구)"
# todohunter 유저로 PM2 systemd 등록
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u todohunter --hp /home/todohunter || true

echo ""
echo "✅ 서버 기본 세팅 완료"
echo ""
echo "다음 단계:"
echo "  1. bash setup-postgres.sh        # DB/유저 생성"
echo "  2. Nginx 도메인 설정 (nginx.conf 참고)"
echo "  3. bash install-runner.sh        # GitHub Actions runner 등록"
echo ""
