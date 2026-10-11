import FailureProbabilityTrendChart from "@/components/dashboard/FailureProbabilityTrendChart";
import { getAllPredictions } from "@/lib/api";

export default async function FailureProbabilityTrend() {
  let result;

  try {
    result = await getAllPredictions();
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        故障確率の推移データを取得できませんでした。
      </div>
    );
  }

  return (
    <FailureProbabilityTrendChart
      machines={result.machines}
      predictions={result.predictions}
    />
  );
}
