"use client";

import { useEffect, useRef } from "react";
import {
  SWORDSMAN_CLIPS,
  SWORDSMAN_SHEET,
  loadSpriteImage,
  drawSpriteFrame,
} from "@/utils/sprite/swordsman";

// 대화창 초상화 — swordsman idle 첫 프레임을 정적으로 1장 렌더.
// outfitId/hairId/hatId props는 하위 호환을 위해 받기만 하고 사용하지 않음(단일 외형).
interface EndingPortraitProps {
  outfitId?: string | null;
  hairId?: string | null;
  hatId?: string | null;
  size?: number;
  /** true 이면 좌우 반전 (npc 가 우측에서 좌측 방향 응시) */
  flipX?: boolean;
}

export default function EndingPortrait({
  size = 96,
  flipX = false,
}: EndingPortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    loadSpriteImage(SWORDSMAN_SHEET).then((img) => {
      if (cancelled) return;
      drawSpriteFrame(ctx, img, SWORDSMAN_CLIPS.idle, 0, size, size, flipX);
    });

    return () => {
      cancelled = true;
    };
  }, [size, flipX]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
