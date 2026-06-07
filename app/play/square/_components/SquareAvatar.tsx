"use client";

import { useEffect, useRef } from "react";
import type { SquareUser } from "./NpcData";
import { STATUS } from "@/constants";
import type { Direction } from "@/utils/stores/squareStore";
import {
  SWORDSMAN_CLIPS,
  SWORDSMAN_SHEET,
  loadSpriteImage,
  drawSpriteFrame,
} from "@/utils/sprite/swordsman";

const AVATAR_SIZE = 120;
const FRAME_INTERVAL = 130; // ms

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface SquareAvatarProps {
  user: SquareUser;
  isWalking?: boolean;
  direction?: Direction;
  onClick?: (e: React.MouseEvent) => void;
}

export default function SquareAvatar({
  user,
  isWalking = false,
  direction = "down",
  onClick,
}: SquareAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const lastTime = useRef(0);

  // swordsman은 오른쪽 기준 → 왼쪽 이동 시 좌우 반전
  const flipX = direction === "left";

  useEffect(() => {
    const clip = isWalking ? SWORDSMAN_CLIPS.walk : SWORDSMAN_CLIPS.idle;
    let cancelled = false;
    frameRef.current = 0;

    loadSpriteImage(SWORDSMAN_SHEET).then((img) => {
      if (cancelled) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      drawSpriteFrame(ctx, img, clip, 0, AVATAR_SIZE, AVATAR_SIZE, flipX);

      const animate = (ts: number) => {
        if (ts - lastTime.current >= FRAME_INTERVAL) {
          lastTime.current = ts;
          frameRef.current = (frameRef.current + 1) % clip.frames;
          drawSpriteFrame(ctx, img, clip, frameRef.current, AVATAR_SIZE, AVATAR_SIZE, flipX);
        }
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    });

    return () => {
      cancelled = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isWalking, flipX]);

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      {/* 정보 오버레이 — 클릭 통과 (캐릭터 본체만 hitbox) */}
      <div className="flex flex-col items-center gap-0.5 min-w-[100px] pointer-events-none">
        {/* 공유 퀘스트 — interactive NPC는 표시 안 함 */}
        {!user.interactive && user.sharedQuest && (
          <div className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-[130px] text-center">
            {user.sharedQuest.name}
            <span className="ml-1 text-yellow-300">
              {STATUS[user.sharedQuest.tagged as keyof typeof STATUS] ?? ""}
            </span>
          </div>
        )}

        {/* 집중시간 — interactive NPC는 표시 안 함 */}
        {!user.interactive && (
          <div
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              user.isRunning
                ? "bg-green-500/80 text-white"
                : "bg-gray-500/60 text-gray-200"
            }`}
          >
            {user.isRunning ? "🟢" : "⏸"} {formatTime(user.focusSeconds)}
          </div>
        )}

        {/* 레벨 + 닉네임 — NPC는 레벨 안 보임, 이름은 초록색으로 */}
        <div className="flex items-center gap-1">
          {!user.isNpc && (
            <span className="bg-[#C84B3A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Lv.{user.level}
            </span>
          )}
          <span
            className={`bg-black/70 text-xs font-semibold px-2 py-0.5 rounded-full ${
              user.isNpc ? "text-green-400" : "text-white"
            }`}
          >
            {user.nickname}
          </span>
        </div>
      </div>

      {/* 캐릭터 아바타 — 클릭은 본체에만 받음 */}
      <canvas
        ref={canvasRef}
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        onClick={onClick}
        className={onClick ? "cursor-pointer" : undefined}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
