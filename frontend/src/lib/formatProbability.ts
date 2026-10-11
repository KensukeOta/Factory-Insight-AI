/**
 * 故障確率をパーセント形式で表示する。
 *
 * @param probability 0〜1の確率
 * @returns 表示用の文字列
 *
 * 例:
 * 0.75       -> "75.00%"
 * 0.005      -> "0.50%"
 * 0.0001234  -> "0.0123%"
 * 0.0000001234 -> "0.0000123%"
 */
export function formatProbability(probability: number): string {
  if (!Number.isFinite(probability)) {
    return "—";
  }

  if (probability === 0) {
    return "0%";
  }

  const percentage = probability * 100;
  const absolutePercentage = Math.abs(percentage);

  if (absolutePercentage >= 0.1) {
    return `${percentage.toFixed(2)}%`;
  }

  if (absolutePercentage >= 0.01) {
    return `${percentage.toFixed(4)}%`;
  }

  if (absolutePercentage >= 0.000001) {
    return `${percentage.toPrecision(3)}%`;
  }

  return `${percentage.toExponential(2)}%`;
}

/**
 * グラフ用のパーセント値を表示する。
 *
 * Rechartsのデータは0〜100の値を使用するため、
 * formatProbability()に渡す前に100で割る。
 */
export function formatChartProbability(percentage: number): string {
  return formatProbability(percentage / 100);
}
