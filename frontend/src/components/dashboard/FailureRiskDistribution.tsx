import FailureRiskDonutChart from "@/components/dashboard/FailureRiskDonutChart";
import { getAllPredictions } from "@/lib/api";

export default async function FailureRiskDistribution() {
  let predictions;

  try {
    const result = await getAllPredictions();
    predictions = result.predictions;
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        故障リスク分布データを取得できませんでした。
      </div>
    );
  }

  const highRiskCount = predictions.filter(
    (prediction) => prediction.predicted_failure,
  ).length;

  const lowRiskCount = predictions.length - highRiskCount;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">故障リスク分布</h3>

      <p className="mt-1 text-sm text-slate-500">全設備の故障予測結果の内訳</p>

      <FailureRiskDonutChart
        highRiskCount={highRiskCount}
        lowRiskCount={lowRiskCount}
      />

      <div className="mt-2 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm text-slate-500">故障リスクあり</p>
          <p className="mt-1 text-xl font-bold text-red-600">
            {highRiskCount}件
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">故障リスク低</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {lowRiskCount}件
          </p>
        </div>
      </div>
    </section>
  );
}
