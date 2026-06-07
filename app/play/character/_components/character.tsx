"use client";

import { useEffect, useRef } from "react";
import {
  SWORDSMAN_CLIPS,
  SWORDSMAN_SHEET,
  loadSpriteImage,
  drawSpriteFrame,
} from "@/utils/sprite/swordsman";

const CANVAS_SIZE = 250;
const FRAME_INTERVAL = 110; // ms

type Direction = "down" | "up" | "right" | "left";

interface CharacterProps {
  direction?: Direction;
  isWalking?: boolean;
}

// swordsman 단일 스프라이트 아바타.
// 정지 = idle 클립 순환, 이동 = walk 클립 순환. 왼쪽 방향이면 좌우 반전.
const Character = ({ direction = "down", isWalking = false }: CharacterProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const lastTime = useRef(0);

  const flipX = direction === "left";

  useEffect(() => {
    const clip = isWalking ? SWORDSMAN_CLIPS.walk : SWORDSMAN_CLIPS.idle;
    let cancelled = false;
    frameRef.current = 0;

    loadSpriteImage(SWORDSMAN_SHEET).then((img) => {
      if (cancelled) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      // 첫 프레임 즉시 렌더
      drawSpriteFrame(ctx, img, clip, 0, CANVAS_SIZE, CANVAS_SIZE, flipX);

      const animate = (ts: number) => {
        if (ts - lastTime.current >= FRAME_INTERVAL) {
          lastTime.current = ts;
          frameRef.current = (frameRef.current + 1) % clip.frames;
          drawSpriteFrame(ctx, img, clip, frameRef.current, CANVAS_SIZE, CANVAS_SIZE, flipX);
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
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{ imageRendering: "pixelated" }}
    />
  );
};

export default Character;
