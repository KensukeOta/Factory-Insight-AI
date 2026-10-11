/**
 * 故障確率グラフの縦軸・横軸の最大値を計算する。
 *
 * 入力値は0〜100のパーセント値。
 * データの最大値に余白を加え、見やすい数値に切り上げる。
 */
export function getProbabilityAxisMax(maxProbability: number): number {
  if (!Number.isFinite(maxProbability) || maxProbability <= 0) {
    return 1;
  }

  const paddedMax = Math.min(100, maxProbability * 1.25);

  const magnitude = 10 ** Math.floor(Math.log10(paddedMax));
  const normalized = paddedMax / magnitude;

  let niceNormalized: number;

  if (normalized <= 1) {
    niceNormalized = 1;
  } else if (normalized <= 2) {
    niceNormalized = 2;
  } else if (normalized <= 5) {
    niceNormalized = 5;
  } else {
    niceNormalized = 10;
  }

  return Math.min(100, niceNormalized * magnitude);
}

/**
 * 0から最大値までの目盛りを5個生成する。
 *
 * 明示的に目盛りを指定することで、
 * Rechartsの自動目盛りによる表示のばらつきを防ぐ。
 */
export function getProbabilityTicks(axisMax: number): number[] {
  return Array.from({ length: 5 }, (_, index) => (axisMax * index) / 4);
}
