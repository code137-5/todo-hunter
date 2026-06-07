import {
  Assets,
  Texture,
  Rectangle,
  Container,
  Sprite,
  RenderTexture,
  type Renderer,
} from "pixi.js";

const DEFAULT_COLS = 8;
const DEFAULT_ROWS = 8;
const DEFAULT_FRAME_SIZE = 64;

export interface SpriteSheetLayer {
  texture: Texture;
  cols: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
}

/** 여러 레이어 이미지를 로드하고 nearest 스케일모드 적용 */
export async function loadSpriteLayers(
  paths: string[]
): Promise<SpriteSheetLayer[]> {
  const layers: SpriteSheetLayer[] = [];

  for (const path of paths) {
    const texture = await Assets.load<Texture>(path);
    texture.source.scaleMode = "nearest";

    layers.push({
      texture,
      cols: DEFAULT_COLS,
      rows: DEFAULT_ROWS,
      frameWidth: DEFAULT_FRAME_SIZE,
      frameHeight: DEFAULT_FRAME_SIZE,
    });
  }

  return layers;
}

/** 단일 이미지 텍스처 로드 (몬스터 프레임 등) */
export async function loadTexture(path: string): Promise<Texture> {
  const texture = await Assets.load<Texture>(path);
  texture.source.scaleMode = "nearest";
  return texture;
}

/**
 * 스프라이트 시트의 특정 행(row)을 프레임 단위 sub-Texture 배열로 슬라이스.
 * (swordsman 단일 시트용. 100x100, 행 = 동작 종류 / 열 = 프레임)
 * 같은 source 텍스처를 공유하므로 동작별로 다시 로드하지 않는다.
 */
export async function loadSpriteStrip(
  path: string,
  frames: number,
  row = 0,
  frameSize = 100
): Promise<Texture[]> {
  const base = await Assets.load<Texture>(path);
  base.source.scaleMode = "nearest";

  const out: Texture[] = [];
  for (let i = 0; i < frames; i++) {
    out.push(
      new Texture({
        source: base.source,
        frame: new Rectangle(i * frameSize, row * frameSize, frameSize, frameSize),
      })
    );
  }
  return out;
}

/**
 * 비정사각 프레임 가로 시트를 프레임 단위 sub-Texture 배열로 슬라이스.
 * (몬스터 상태 시트용. 프레임 너비≠높이 가능. row로 다중행도 지원.)
 * 같은 source 텍스처를 공유한다.
 */
export async function loadSpriteFrames(
  path: string,
  frames: number,
  frameWidth: number,
  frameHeight: number,
  row = 0
): Promise<Texture[]> {
  const base = await Assets.load<Texture>(path);
  base.source.scaleMode = "nearest";

  const out: Texture[] = [];
  const sy = row * frameHeight;
  for (let i = 0; i < frames; i++) {
    out.push(
      new Texture({
        source: base.source,
        frame: new Rectangle(i * frameWidth, sy, frameWidth, frameHeight),
      })
    );
  }
  return out;
}

/** 여러 레이어의 특정 프레임을 합성하여 RenderTexture에 그림 */
export function compositeFrame(
  renderer: Renderer,
  layers: SpriteSheetLayer[],
  frameIndex: number,
  size: number,
  target: RenderTexture
): void {
  const container = new Container();

  for (const layer of layers) {
    const col = frameIndex % layer.cols;
    const row = Math.floor(frameIndex / layer.cols);
    const sx = col * layer.frameWidth;
    const sy = row * layer.frameHeight;

    const frameTexture = new Texture({
      source: layer.texture.source,
      frame: new Rectangle(sx, sy, layer.frameWidth, layer.frameHeight),
    });

    const sprite = new Sprite(frameTexture);
    sprite.width = size;
    sprite.height = size;
    container.addChild(sprite);
  }

  renderer.render({ container, target });
  container.destroy({ children: true });
}

/** RenderTexture를 생성 (재사용 가능) */
export function createRenderTexture(
  renderer: Renderer,
  size: number
): RenderTexture {
  return RenderTexture.create({ width: size, height: size });
}
