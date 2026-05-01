"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useQuestStore } from "@/utils/stores/questStore";
import { Tag } from "@/components/common/Tag";
import { Button } from "@/components/common/Button";
import { useRouter } from "next/navigation";
import SubTaskSplitModal from "@/components/quest/SubTaskSplitModal";

// 한국어 요일 → 정렬 인덱스 (월=0, ..., 일=6)
const DAY_ORDER: Record<string, number> = {
  "월": 0, "화": 1, "수": 2, "목": 3, "금": 4, "토": 5, "일": 6,
};

const WeeklyQuest = ({ hideHeader, hideAddButton }: { hideHeader?: boolean; hideAddButton?: boolean }) => {
  const { quests, fetchQuests, completeQuest, completeSubTask, deleteQuest, loading, error } = useQuestStore();
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [splitTarget, setSplitTarget] = useState<number | null>(null);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const onAddQuestHandler = () => {
    router.push("quest/add-quest");
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // 주간 퀘스트 정렬: 오늘 해당 quest 우선 → 그 다음 가장 빠른 요일 기준
  const sortedWeeklyQuests = useMemo(() => {
    const todayKo = ["일", "월", "화", "수", "목", "금", "토"][new Date().getDay()];
    const earliestDayIdx = (days?: string[]) => {
      if (!days || days.length === 0) return 99;
      return Math.min(...days.map((d) => DAY_ORDER[d] ?? 99));
    };
    return quests
      .filter((q) => q.isWeekly)
      .slice()
      .sort((a, b) => {
        const aHasToday = a.days?.includes(todayKo) ? 0 : 1;
        const bHasToday = b.days?.includes(todayKo) ? 0 : 1;
        if (aHasToday !== bHasToday) return aHasToday - bHasToday;
        return earliestDayIdx(a.days) - earliestDayIdx(b.days);
      });
  }, [quests]);

  return (
    <div className="pt-0">
      {!hideHeader && (
        <h2 className="p-3 w-fit bg-black text-white font-bold">
          주간 퀘스트 ({quests.filter((q) => q.isWeekly && q.completed).length}/
          {quests.filter((q) => q.isWeekly).length})
        </h2>
      )}

      {loading ? (
        <p className="text-center text-gray-500">로딩 중...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="space-y-3">
          {sortedWeeklyQuests.map((quest) => {
            const { id, name, tagged, completed, expiredAt, days, streak, subTasks } = quest;
            const hasSubTasks = !!subTasks && subTasks.length > 0;
            const completedSubCount = subTasks?.filter((s) => s.completedAt).length ?? 0;
            const totalSubCount = subTasks?.length ?? 0;
            const expanded = expandedIds.has(id);

            return (
              <div
                key={id}
                className={`is-rounded ${completed ? "opacity-50 bg-gray-100" : "bg-white"}`}
              >
                <div className="flex items-center gap-3 p-2.5">
                  <button
                    className="shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={completed || hasSubTasks}
                    onClick={() => { if (!completed && !hasSubTasks) completeQuest(id); }}
                    title={hasSubTasks ? "서브태스크를 모두 완료해야 합니다" : ""}
                  >
                    <Image
                      src={completed ? "/icons/check_on.svg" : "/icons/check_off.svg"}
                      width={20}
                      height={20}
                      alt={completed ? "완료" : "미완료"}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm truncate block">{name}</span>
                    <p className="text-xs text-gray-500 flex flex-wrap items-center gap-x-1.5">
                      {days && days.length > 0 && <span>{days.join("·")}</span>}
                      {streak && streak > 0 ? (
                        <span className="text-orange-500 font-bold">🔥 {streak}주 연속</span>
                      ) : null}
                      {hasSubTasks && (
                        <span>서브 {completedSubCount}/{totalSubCount}</span>
                      )}
                    </p>
                    {expiredAt && (
                      <p className="text-xs text-gray-400">{formatDate(expiredAt)}</p>
                    )}
                  </div>
                  <Tag variant={tagged}>{tagged}</Tag>
                  {hasSubTasks && (
                    <button
                      className="shrink-0 cursor-pointer text-xs text-gray-500 px-1"
                      onClick={() => toggleExpand(id)}
                      aria-label={expanded ? "접기" : "펼치기"}
                    >
                      {expanded ? "▲" : "▼"}
                    </button>
                  )}
                  {!completed && (
                    <button
                      type="button"
                      className="shrink-0 cursor-pointer"
                      onClick={() => setSplitTarget(id)}
                      title="할일 쪼개기"
                    >
                      <Image
                        src="/icons/Numbered-List.svg"
                        width={20}
                        height={20}
                        alt="할일 쪼개기"
                      />
                    </button>
                  )}
                  {!completed && (
                    <button
                      className="shrink-0 cursor-pointer"
                      onClick={() => router.push(`/play/quest/edit-quest/${id}`)}
                    >
                      <Image src="/icons/Pencil.png" width={20} height={20} alt="수정" />
                    </button>
                  )}
                  {!completed && (
                    <button className="shrink-0 cursor-pointer" onClick={() => deleteQuest(id)}>
                      <Image src="/icons/circle-x.svg" width={20} height={20} alt="삭제" />
                    </button>
                  )}
                </div>

                {/* 서브태스크 펼침 영역 */}
                {hasSubTasks && expanded && (
                  <div className="border-t border-gray-200 px-3 py-2 space-y-1.5">
                    {subTasks!.map((s) => {
                      const isDone = !!s.completedAt;
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <button
                            className="shrink-0 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isDone || completed}
                            onClick={() => { if (!isDone && !completed) completeSubTask(id, s.id); }}
                          >
                            <Image
                              src={isDone ? "/icons/check_on.svg" : "/icons/check_off.svg"}
                              width={16}
                              height={16}
                              alt={isDone ? "완료" : "미완료"}
                            />
                          </button>
                          <span
                            className={`text-xs flex-1 truncate ${
                              isDone ? "line-through text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {s.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {!hideAddButton && (
        <div className="flex justify-center">
          <Button size="L" className="mt-2" onClick={onAddQuestHandler}>
            ⚡ 할 일 추가
          </Button>
        </div>
      )}

      {/* 할일 쪼개기 모달 */}
      {splitTarget !== null && (() => {
        const target = quests.find((q) => q.id === splitTarget);
        if (!target) return null;
        return (
          <SubTaskSplitModal
            questId={target.id}
            questName={target.name}
            questTagged={target.tagged}
            questDifficulty={target.difficulty}
            existingSubTasks={target.subTasks ?? []}
            onClose={() => setSplitTarget(null)}
          />
        );
      })()}
    </div>
  );
};

export default WeeklyQuest;
