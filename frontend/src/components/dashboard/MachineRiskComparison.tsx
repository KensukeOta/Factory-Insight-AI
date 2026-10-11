import MachineRiskBarChart, {
  type MachineRiskChartData,
} from "@/components/dashboard/MachineRiskBarChart";

import { getAllPredictions } from "@/lib/api";

export default async function MachineRiskComparison() {
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
        設備別の故障確率データを取得できませんでした。
      </div>
    );
  }

  // getAllPredictions()は予測日時の新しい順に並んでいる
  const latestPredictions = new Map<string, MachineRiskChartData>();

  for (const prediction of predictions) {
    if (latestPredictions.has(prediction.machine_id)) {
      continue;
    }

    latestPredictions.set(prediction.machine_id, {
      machineId: prediction.machine_id,
      machineName: prediction.machine_name,
      probability: prediction.failure_probability * 100,
      predictedFailure: prediction.predicted_failure,
    });
  }

  const chartData = Array.from(latestPredictions.values()).sort(
    (a, b) => b.probability - a.probability,
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">設備別の故障確率</h3>

      <p className="mt-1 text-sm text-slate-500">
        各設備の最新の故障予測結果を比較
      </p>

      <div className="mt-4">
        <MachineRiskBarChart data={chartData} />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        ※ 故障予測を実行した設備のみ表示しています。
      </p>
    </section>
  );
}
