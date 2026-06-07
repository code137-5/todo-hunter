"use client";

import { useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import styles from "./character.module.css";

// 스탯 태그 → 표시 라벨 매핑 (성장 기록용)
const TAG_TO_LABEL: Record<string, string> = {
    STR: "체력",
    INT: "지력",
    EMO: "매력",
    FIN: "경제력",
    LIV: "생활력",
};

export interface RecentCompletedItem {
    successDayId: number;
    questName: string;
    tagged: string;
    difficulty: string;
    statGain: number;
    completedAt: string;
}

interface StatsTabsProps {
    recentCompleted: RecentCompletedItem[];
}

/* ============================================================
   퍼블리싱용 샘플 데이터 (실데이터 연동 전 — 결정론적으로 생성)
   ============================================================ */

// 24시간 분포 — 아침/저녁 두 봉우리를 가진 결정론적 샘플
const HOUR_BUCKETS: number[] = Array.from({ length: 24 }, (_, h) => {
    const morning = Math.exp(-((h - 7) ** 2) / 6) * 9; // 7시 피크
    const evening = Math.exp(-((h - 20) ** 2) / 8) * 5; // 20시 피크
    return Math.round(morning + evening);
});

// 시간대별 스포크 색상 (6시간 단위 4분할)
function hourColor(h: number): string {
    if (h >= 6 && h < 12) return "#E0A04E"; // 아침 — 주황
    if (h >= 12 && h < 18) return "#6AAF6A"; // 오후 — 초록
    if (h >= 18 && h < 24) return "#9E7AC0"; // 저녁 — 보라
    return "#6B8FB8"; // 새벽 — 파랑
}

// 잔디 — 최근 1년(364일) 결정론적 완료 수
const GRASS_DAYS: number[] = Array.from({ length: 364 }, (_, i) => {
    const dow = i % 7;
    const weekend = dow === 0 || dow === 6 ? 3 : 1;
    // 결정론적 의사난수 (사인 기반)
    const wobble = Math.round((Math.sin(i * 1.7) + Math.sin(i * 0.4) + 2) * 1.6);
    return Math.max(0, weekend + wobble - 1);
});

function grassColor(count: number): string {
    if (count <= 0) return "#EBE3CF";
    if (count < 2) return "#C6E0B4";
    if (count < 4) return "#8FC97A";
    if (count < 6) return "#5B8C5A";
    return "#3A6B3A";
}

export default function StatsTabs({ recentCompleted }: StatsTabsProps) {
    const [tab, setTab] = useState("rhythm");

    // ── 생활 리듬: 피크 시간 계산 ──
    const peakHour = useMemo(() => {
        let max = -1;
        let idx = 0;
        HOUR_BUCKETS.forEach((v, i) => {
            if (v > max) {
                max = v;
                idx = i;
            }
        });
        return idx;
    }, []);
    const maxBucket = Math.max(...HOUR_BUCKETS, 1);
    const peakLabel =
        peakHour < 12 ? "아침형 인간" : peakHour < 18 ? "오후형 인간" : "저녁형 인간";
    const peakEmoji = peakHour < 12 ? "🌅" : peakHour < 18 ? "☀️" : "🌙";

    // ── 잔디: KPI 계산 ──
    const grassStats = useMemo(() => {
        const total = GRASS_DAYS.reduce((a, b) => a + b, 0);
        let cur = 0;
        let best = 0;
        GRASS_DAYS.forEach((c) => {
            if (c > 0) {
                cur += 1;
                best = Math.max(best, cur);
            } else {
                cur = 0;
            }
        });
        const week = GRASS_DAYS.slice(-7).reduce((a, b) => a + b, 0);
        return { total, best, week };
    }, []);

    // ── 잔디 SVG 좌표 ──
    const CELL = 11;
    const GAP = 3;
    const WEEKS = Math.ceil(GRASS_DAYS.length / 7);
    const gridW = 24 + WEEKS * (CELL + GAP);
    const gridH = 16 + 7 * (CELL + GAP);

    // ── 리듬 시계 SVG 스포크 ──
    const CLOCK = 240;
    const CX = CLOCK / 2;
    const CY = CLOCK / 2;
    const INNER = 22; // 가운데 빈 원
    const OUTER = 96; // 최대 스포크 길이 반경
    const spokes = HOUR_BUCKETS.map((count, h) => {
        const angle = (h / 24) * 2 * Math.PI; // 위(0시)에서 시계방향
        const len = INNER + (count / maxBucket) * (OUTER - INNER);
        const sx = CX + INNER * Math.sin(angle);
        const sy = CY - INNER * Math.cos(angle);
        const ex = CX + len * Math.sin(angle);
        const ey = CY - len * Math.cos(angle);
        return { h, sx, sy, ex, ey, color: hourColor(h) };
    });

    return (
        <div className={styles["stats-dash"]}>
            <Tabs.Root value={tab} onValueChange={setTab}>
                {/* ===== 패널 본문 (탭을 패널 내부에 삽입) ===== */}
                <div className={styles["stats-panel-frame"]}>
                    {/* 패널 내부 상단 — 세그먼트형 탭 */}
                    <Tabs.List className={styles["stats-tablist"]} aria-label="통계 탭">
                        <Tabs.Trigger value="rhythm" className={styles["stats-tab"]}>
                            🕐 생활 리듬
                        </Tabs.Trigger>
                        <Tabs.Trigger value="growth" className={styles["stats-tab"]}>
                            📜 성장 기록
                        </Tabs.Trigger>
                        <Tabs.Trigger value="grass" className={styles["stats-tab"]}>
                            🌱 성장정원
                        </Tabs.Trigger>
                    </Tabs.List>

                    {/* ── 1. 생활 리듬 시계 ── */}
                    <Tabs.Content value="rhythm" className={styles["stats-tabpanel"]}>
                        <h3 className={styles["stats-section-title"]}>⏰ 생활 리듬 시계</h3>
                        <p className={styles["stats-section-sub"]}>
                            하루 중 언제 퀘스트를 완료하는지 — 24시간 분포.
                        </p>
                        <div className={styles["rhythm-clock-wrap"]}>
                            <svg
                                viewBox={`0 0 ${CLOCK} ${CLOCK}`}
                                className={styles["rhythm-clock-svg"]}
                                role="img"
                                aria-label="24시간 완료 분포 시계"
                            >
                                {/* 바깥 테두리 원 */}
                                <circle
                                    cx={CX}
                                    cy={CY}
                                    r={OUTER + 14}
                                    fill="none"
                                    stroke="#C8A04E"
                                    strokeWidth={1.5}
                                    opacity={0.6}
                                />
                                {/* 스포크 */}
                                {spokes.map((s) => (
                                    <line
                                        key={s.h}
                                        x1={s.sx}
                                        y1={s.sy}
                                        x2={s.ex}
                                        y2={s.ey}
                                        stroke={s.color}
                                        strokeWidth={5}
                                        strokeLinecap="round"
                                    />
                                ))}
                                {/* 가운데 원 */}
                                <circle cx={CX} cy={CY} r={INNER} fill="#4A3F2F" />
                                <text
                                    x={CX}
                                    y={CY + 5}
                                    textAnchor="middle"
                                    fontSize="16"
                                >
                                    🕐
                                </text>
                                {/* 시각 라벨 24 / 6 / 12 / 18 */}
                                <text x={CX} y={18} textAnchor="middle" className={styles["clock-num"]}>24</text>
                                <text x={CLOCK - 8} y={CY + 4} textAnchor="end" className={styles["clock-num"]}>6</text>
                                <text x={CX} y={CLOCK - 6} textAnchor="middle" className={styles["clock-num"]}>12</text>
                                <text x={10} y={CY + 4} textAnchor="start" className={styles["clock-num"]}>18</text>
                            </svg>
                        </div>
                        <div className={styles["rhythm-peak"]}>
                            {peakEmoji} {peakLabel}{" "}
                            <span className={styles["rhythm-peak-hl"]}>(피크 {peakHour}시)</span>
                        </div>
                        <p className={styles["stats-panel-desc"]}>바깥쪽으로 길수록 그 시간대에 많이 완료</p>
                    </Tabs.Content>

                    {/* ── 2. 성장 기록 ── */}
                    <Tabs.Content value="growth" className={styles["stats-tabpanel"]}>
                        <h3 className={styles["stats-section-title"]}>📜 성장 기록</h3>
                        <p className={styles["stats-section-sub"]}>최근 완료한 퀘스트와 능력치 변화.</p>
                        <div className={styles["growth-list"]}>
                            {recentCompleted.length === 0 ? (
                                <div
                                    className={styles["growth-item"]}
                                    style={{ justifyContent: "center", color: "#8A7D6B" }}
                                >
                                    <span>아직 완료한 퀘스트가 없어요.</span>
                                </div>
                            ) : (
                                recentCompleted.map((item) => {
                                    const date = new Date(item.completedAt);
                                    const dateStr = `${(date.getMonth() + 1)
                                        .toString()
                                        .padStart(2, "0")}.${date
                                        .getDate()
                                        .toString()
                                        .padStart(2, "0")}`;
                                    const statLabel =
                                        TAG_TO_LABEL[item.tagged] ?? item.tagged;
                                    return (
                                        <div key={item.successDayId} className={styles["growth-item"]}>
                                            <span className={styles["growth-date"]}>{dateStr}</span>
                                            <span className={styles["growth-msg"]}>{item.questName}</span>
                                            <span className={styles["growth-gain"]}>
                                                {statLabel} +{item.statGain}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Tabs.Content>

                    {/* ── 3. 성장 정원*/}
                    <Tabs.Content value="grass" className={styles["stats-tabpanel"]}>
                        <div className={styles["grass-kpi-row"]}>
                            <div className={styles["grass-kpi"]}>
                                <div className={styles["grass-kpi-num"]}>{grassStats.total}</div>
                                <div className={styles["grass-kpi-label"]}>총 완료</div>
                            </div>
                            <div className={styles["grass-kpi"]}>
                                <div className={styles["grass-kpi-num"]}>{grassStats.best}</div>
                                <div className={styles["grass-kpi-label"]}>최장 연속(일)</div>
                            </div>
                            <div className={styles["grass-kpi"]}>
                                <div className={styles["grass-kpi-num"]}>{grassStats.week}</div>
                                <div className={styles["grass-kpi-label"]}>이번 주</div>
                            </div>
                        </div>
                        <h3 className={styles["stats-section-title"]}>🌱 완료 잔디 (최근 1년)</h3>
                        <div className={styles["grass-scroll"]}>
                            <svg
                                width={gridW}
                                height={gridH}
                                role="img"
                                aria-label="최근 1년 완료 잔디"
                            >
                                {["", "월", "", "수", "", "금", ""].map((t, i) =>
                                    t ? (
                                        <text
                                            key={i}
                                            x={2}
                                            y={16 + i * (CELL + GAP) + CELL - 1}
                                            className={styles["grass-axis"]}
                                        >
                                            {t}
                                        </text>
                                    ) : null
                                )}
                                {GRASS_DAYS.map((count, i) => {
                                    const week = Math.floor(i / 7);
                                    const dow = i % 7;
                                    return (
                                        <rect
                                            key={i}
                                            x={20 + week * (CELL + GAP)}
                                            y={14 + dow * (CELL + GAP)}
                                            width={CELL}
                                            height={CELL}
                                            rx={2}
                                            fill={grassColor(count)}
                                            className={styles["grass-cell"]}
                                        >
                                            <title>{`완료 ${count}개`}</title>
                                        </rect>
                                    );
                                })}
                            </svg>
                        </div>
                        <div className={styles["grass-legend"]}>
                            <span>적음</span>
                            <span className={styles["grass-sq"]} style={{ background: "#EBE3CF" }} />
                            <span className={styles["grass-sq"]} style={{ background: "#C6E0B4" }} />
                            <span className={styles["grass-sq"]} style={{ background: "#8FC97A" }} />
                            <span className={styles["grass-sq"]} style={{ background: "#5B8C5A" }} />
                            <span className={styles["grass-sq"]} style={{ background: "#3A6B3A" }} />
                            <span>많음</span>
                        </div>
                        <p className={styles["stats-panel-desc"]}>
                            SuccessDay를 날짜별 집계 → 잔디. 칸 호버 시 완료 수.
                        </p>
                    </Tabs.Content>
                </div>
            </Tabs.Root>
        </div>
    );
}
