"use client";

import { useEffect, useRef } from "react";
import {
  loadLayers,
  renderLayers,
  type LayerConfig,
  type SpriteSheet,
} from "@/utils/sprite/SpriteLayerRenderer";
import { useUserStore } from "@/utils/stores/userStore";
import {
  getOutfitSrc,
  getHairSrc,
  getHatSrc,
  DEFAULT_OUTFIT_ID,
  DEFAULT_HAIR_ID,
} from "@/constants/appearance";

const BASE_PATH = "/images/asprites/char_a_p1";
const BODY_SRC = `${BASE_PATH}/char_a_p1_0bas_humn_v00.png`;

const CANVAS_SIZE = 250;

const Character = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetsRef = useRef<SpriteSheet[]>([]);

  // userStore 의 외형 — 변경되면 즉시 재렌더
  const outfitId = useUserStore((s) => s.outfitId);
  const hairId = useUserStore((s) => s.hairId);
  const hatId = useUserStore((s) => s.hatId);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.imageSmoothingEnabled = false;

    const layers: LayerConfig[] = [
      { src: BODY_SRC },
      { src: getOutfitSrc(outfitId) ?? getOutfitSrc(DEFAULT_OUTFIT_ID)! },
      { src: getHairSrc(hairId) ?? getHairSrc(DEFAULT_HAIR_ID)! },
    ];
    const hatSrc = getHatSrc(hatId);
    if (hatSrc) layers.push({ src: hatSrc });

    let cancelled = false;
    loadLayers(layers).then((sheets) => {
      if (cancelled) return;
      sheetsRef.current = sheets;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      renderLayers(ctx, sheets, 0, CANVAS_SIZE, CANVAS_SIZE);
    });

    return () => {
      cancelled = true;
    };
  }, [outfitId, hairId, hatId]);

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
