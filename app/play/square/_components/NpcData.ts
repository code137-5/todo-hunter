export interface SquareUser {
  id: string | number;
  nickname: string;
  level: number;
  focusSeconds: number;
  isRunning: boolean;
  sharedQuest: { name: string; tagged: string } | null;
  isNpc: boolean;
  // 클릭형 NPC — 타이머/공유퀘스트 UI 숨김 + 클릭 핸들러 활성화
  interactive?: boolean;
}

// NPC mock 데이터 (나중에 실제 유저 API 응답으로 교체)
export const NPC_USERS: SquareUser[] = [
  {
    id: "npc-1",
    nickname: "용사 길동",
    level: 5,
    focusSeconds: 3720,
    isRunning: true,
    sharedQuest: { name: "알고리즘 문제 풀기", tagged: "INT" },
    isNpc: true,
  },
  {
    id: "npc-2",
    nickname: "의문의 마법사",
    level: 8,
    focusSeconds: 0,
    isRunning: false,
    sharedQuest: null,
    isNpc: true,
    interactive: true,
  },
  {
    id: "npc-3",
    nickname: "전사 민호",
    level: 3,
    focusSeconds: 1800,
    isRunning: true,
    sharedQuest: { name: "운동 30분", tagged: "STR" },
    isNpc: true,
  },
  {
    id: "npc-4",
    nickname: "도적 하늘",
    level: 12,
    focusSeconds: 14400,
    isRunning: false,
    sharedQuest: null,
    isNpc: true,
  },
];
