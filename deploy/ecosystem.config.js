// PM2 설정 — 배포 시 /home/todohunter/ecosystem.config.js 로 복사됨
// deploy.yml 에서 pm2 reload /home/todohunter/ecosystem.config.js --only todohunter-app 으로 호출

module.exports = {
  apps: [
    {
      name: "todohunter-app",
      cwd: "/home/todohunter/todohunter-repo/todohunter-app",
      script: "npm",
      args: "start",

      // 리소스
      instances: 1,           // Next.js는 보통 단일 인스턴스 (내부적으로 이벤트 루프)
      max_memory_restart: "800M", // 미니PC 고려, 메모리 누수 시 자동 재시작

      // 재시작 정책
      autorestart: true,
      watch: false,            // 파일 변경 감시 X (프로덕션)
      max_restarts: 10,        // 1분 내 10회 이상 크래시 시 멈춤
      min_uptime: "30s",       // 30초 이상 돌아야 정상 기동으로 카운트
      restart_delay: 3000,     // 크래시 후 3초 대기

      // 로그
      error_file: "/home/todohunter/logs/todohunter-app.error.log",
      out_file: "/home/todohunter/logs/todohunter-app.out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // 환경변수 (실제 값은 .env 파일이 로드함)
      env: {
        NODE_ENV: "production",
        PORT: 3050,
        TZ: "Asia/Seoul",       // 타임존 고정 (엔딩 주간 계산 정확성)
      },
    },
  ],
};
