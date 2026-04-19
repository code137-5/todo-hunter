#!/usr/bin/env bash
# GitHub Actions self-hosted runner 설치 (todohunter 유저로 실행)
# 실행: sudo -u todohunter bash install-runner.sh
#
# 사전 준비:
#   1. https://github.com/ggoldJeongg/todo-hunter/settings/actions/runners/new 접속
#   2. 토큰과 URL 복사 (아래 프롬프트에 입력)
#   3. 라벨: self-hosted, todohunter-runner 지정 (deploy.yml 과 매칭)

set -euo pipefail

if [[ $(whoami) != "todohunter" ]]; then
  echo "❌ todohunter 유저로 실행하세요: sudo -u todohunter bash $0"
  exit 1
fi

RUNNER_DIR="/home/todohunter/actions-runner"
RUNNER_VERSION="2.321.0"  # 최신 버전 확인: https://github.com/actions/runner/releases
ARCH="linux-x64"

if [[ -d "$RUNNER_DIR" ]]; then
  echo "⚠️  $RUNNER_DIR 이미 존재"
  read -rp "삭제하고 다시 설치? (y/N): " yn
  [[ "$yn" != "y" ]] && exit 1
  rm -rf "$RUNNER_DIR"
fi

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

echo "▶ Runner 다운로드 v${RUNNER_VERSION}"
curl -fLo actions-runner.tar.gz \
  "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-${ARCH}-${RUNNER_VERSION}.tar.gz"

echo "▶ 압축 해제"
tar xzf actions-runner.tar.gz
rm actions-runner.tar.gz

echo ""
echo "▶ GitHub Runner 등록 정보 입력"
echo "   https://github.com/ggoldJeongg/todo-hunter/settings/actions/runners/new"
echo "   위 페이지에서 'url' 과 'token' 을 복사해서 입력하세요."
echo ""
read -rp "GitHub Repo URL (예: https://github.com/ggoldJeongg/todo-hunter): " GH_URL
read -rp "Registration Token: " GH_TOKEN

echo "▶ 등록 (라벨: todohunter-runner)"
./config.sh \
  --url "$GH_URL" \
  --token "$GH_TOKEN" \
  --name "todohunter-homeserver" \
  --labels "todohunter-runner" \
  --work "_work" \
  --unattended \
  --replace

echo ""
echo "✅ Runner 등록 완료"
echo ""
echo "이제 systemd 서비스로 등록해서 백그라운드 실행:"
echo ""
echo "  sudo ./svc.sh install todohunter"
echo "  sudo ./svc.sh start"
echo "  sudo ./svc.sh status"
echo ""
echo "위 3줄은 root 권한이라 별도로 실행해야 합니다."
echo "설치 후 GitHub Actions 탭에서 runner가 'Idle' 상태로 뜨면 성공."
