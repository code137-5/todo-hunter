// EndingState는 constants/enum.ts에서 정의됨

// ==================== 배경 이미지 매핑 ====================

const BG = {
  battle: "/endings/fight.png",
  library: "/endings/library.png",
  forest: "/endings/forest.png",
  market: "/endings/square.png",
  village: "/endings/town.png",
  lazy: "/endings/bad_room.png",
  hero: "/endings/hero.png", // TODO: 전용 이미지 생성 후 교체 (현재 town.png 복사본)
} as const;

// ==================== 엔딩 데이터 (endingCode → 이미지, 스토리) ====================

interface EndingInfo {
  name: string;
  story: string[];
  image: string;
}

export const ENDING_MAP: Record<string, EndingInfo> = {
  // 특수 엔딩
  LAZY_ADVENTURER: {
    name: "나태한 모험가",
    story: [
      "여관 침대에서 뒹굴며 한 주가 지나갔다.",
      "창밖으로 들려오는 모험가들의 발소리가 점점 멀어진다.",
      '"내일부터 시작하지 뭐..." 라고 중얼거리며 다시 눈을 감는다.',
    ],
    image: BG.lazy,
  },
  TRUE_HERO: {
    name: "진정한 용사",
    story: [
      "검술도, 마법도, 마음도, 살림도 모두 갈고닦은 한 주.",
      '마을 사람들이 말한다. "저 사람이야말로 진정한 용사다."',
      "어떤 위기가 와도 흔들리지 않는, 균형 잡힌 영웅의 모습이 빛난다.",
    ],
    image: BG.hero,
  },
  LEGENDARY: {
    name: "전설의 영웅",
    story: [
      "모든 분야에서 극에 달한 능력치. 세계가 당신의 이름을 기억한다.",
      '전설은 이렇게 기록된다 — "그는 모든 것을 해냈다."',
      "왕국의 기사도, 마법학원의 현자도, 모두가 당신을 우러러본다.",
    ],
    image: BG.hero,
  },

  // 단일 스탯 엔딩
  STEEL_WARRIOR: {
    name: "강철의 전사",
    story: [
      "쉬지 않고 몸을 단련한 한 주. 근육에 힘이 넘친다.",
      "마을을 위협하던 몬스터를 압도적인 힘으로 제압했다.",
      '"강철의 전사 만세!" 사람들이 환호한다.',
    ],
    image: BG.battle,
  },
  SAGE_PATH: {
    name: "현자의 길",
    story: [
      "지식을 갈구하며 책과 함께한 한 주.",
      "고대 마법서를 해독해 몬스터의 약점을 간파했다.",
      "힘이 아닌 지혜로 거둔 승리. 마법학원에서 초청장이 왔다.",
    ],
    image: BG.library,
  },
  EMPATHY_POET: {
    name: "공감의 시인",
    story: [
      "마음을 열고 세상과 교감한 한 주.",
      "몬스터와 대화에 성공했다. 알고 보니 외로운 존재였다.",
      "칼 대신 말로 해결한 이야기가 마을에 퍼진다.",
    ],
    image: BG.forest,
  },
  GOLDEN_MERCHANT: {
    name: "황금의 상인",
    story: [
      "재화를 모으고 투자한 한 주. 금화가 쌓여간다.",
      "용병을 고용해 몬스터를 처리하고, 마을 경제를 부흥시켰다.",
      '"돈이면 안 되는 게 없지." 자신만만한 미소를 짓는다.',
    ],
    image: BG.market,
  },
  VILLAGE_GUARDIAN: {
    name: "마을의 수호자",
    story: [
      "마을 곳곳을 정비하며 보낸 한 주.",
      "성벽을 보강하고 함정을 설치해 몬스터가 접근조차 못 한다.",
      "마을 사람들이 평화로운 밤을 보낸다. 모두 당신 덕분이다.",
    ],
    image: BG.village,
  },

  // 듀얼 스탯 엔딩
  MAGIC_SWORDSMAN: {
    name: "마검사",
    story: [
      "검과 마법, 두 가지 길을 동시에 걸은 한 주.",
      "전략적 전투로 보스급 몬스터를 단독 격파했다.",
      "마법 검사의 전설이 시작된다.",
    ],
    image: BG.battle,
  },
  GUARDIAN_KNIGHT: {
    name: "수호기사",
    story: [
      "힘을 기르되, 지키고 싶은 사람을 떠올린 한 주.",
      "동료가 위험에 빠졌을 때 몸을 던져 막아냈다.",
      '"당신이 있어서 든든합니다." 동료의 눈에 눈물이 맺힌다.',
    ],
    image: BG.battle,
  },
  ARENA_CHAMPION: {
    name: "투기장의 챔피언",
    story: [
      "전투력을 갈고닦으며 상금을 노린 한 주.",
      "투기장에서 연전연승. 명성과 부를 동시에 거머쥐었다.",
      "관중의 환호 속에서 챔피언 벨트를 들어올린다.",
    ],
    image: BG.battle,
  },
  WILD_HUNTER: {
    name: "자급자족 사냥꾼",
    story: [
      "숲에서 몸을 단련하며 자연과 함께한 한 주.",
      "몬스터를 사냥하고, 직접 요리하고, 자유롭게 살아간다.",
      "누구에게도 얽매이지 않는 사냥꾼의 삶.",
    ],
    image: BG.forest,
  },
  HEALING_MAGE: {
    name: "치유의 마법사",
    story: [
      "지식과 공감 능력을 함께 키운 한 주.",
      "치유 마법을 개발해 몬스터에게 상처받은 마을 사람을 치료했다.",
      '"고마워요, 선생님." 아이의 미소가 보답이다.',
    ],
    image: BG.library,
  },
  ALCHEMIST: {
    name: "연금술사",
    story: [
      "지식을 돈으로 바꾸는 법을 터득한 한 주.",
      "몬스터 재료로 묘약을 제조해 대박 사업을 벌였다.",
      "실험실과 금고가 동시에 가득 찬다.",
    ],
    image: BG.library,
  },
  INVENTOR: {
    name: "발명가",
    story: [
      "머리를 쓰며 생활을 개선한 한 주.",
      "마법 도구를 발명해 마을의 생활 수준을 한 단계 끌어올렸다.",
      '"이 세상을 더 편리하게!" 오늘도 설계도를 그린다.',
    ],
    image: BG.village,
  },
  BARD: {
    name: "음유시인",
    story: [
      "감성과 사업 감각을 동시에 발휘한 한 주.",
      "모험담을 노래로 만들어 전국을 순회한다.",
      "감동과 금화를 동시에 거두는 예술가의 삶.",
    ],
    image: BG.market,
  },
  DRUID: {
    name: "드루이드",
    story: [
      "자연과 마음으로 교감한 한 주.",
      "숲의 정령과 친구가 되어 자연의 균형을 지킨다.",
      '"숲이 당신을 기억합니다." 바람이 속삭인다.',
    ],
    image: BG.forest,
  },
  GUILD_MASTER: {
    name: "길드 마스터",
    story: [
      "재정과 실무를 동시에 챙긴 한 주.",
      "모험가 길드를 설립하고 체계적으로 마을을 운영한다.",
      "모든 모험가가 당신의 길드 문을 두드린다.",
    ],
    image: BG.market,
  },
  ORDINARY_DAY: {
    name: "평범한 하루",
    story: [
      "특별할 것 없는 평범한 한 주가 지나갔다.",
      "대단한 일은 없었지만, 그래도 하루하루를 살았다.",
      "다음 주에는 좀 더 열심히 해볼까?",
    ],
    image: BG.village,
  },
};

// ==================== 기본값 ====================

export const DEFAULT_ENDING_IMAGE = BG.village;
export const DEFAULT_ENDING_PROMPT = "당신만의 특별한 여정이 새로운 이야기를 만들어냈습니다...";

// ==================== 페이드 애니메이션 ====================

export const FADE_STEP_DURATION = 500;
export const TOTAL_FADE_DURATION = FADE_STEP_DURATION * 7;
export const TOAST_DELAY = 500;
