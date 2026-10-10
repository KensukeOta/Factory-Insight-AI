import { getPredictions } from "@/lib/api";
import type { Prediction } from "@/lib/api";

type PredictionHistoryProps = {
  machineId: string;
};

export default async function PredictionHistory({
  machineId,
}: PredictionHistoryProps) {
  let predictions: Prediction[];

  try {
    predictions = await getPredictions(machineId);
  } catch {
    return (
      <section
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        故障予測履歴を取得できませんでした。
      </section>
    );
  }

  const sortedPredictions = [...predictions].sort(
    (a, b) =>
      new Date(b.predicted_at).getTime() - new Date(a.predicted_at).getTime(),
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">故障予測履歴</h3>

      {sortedPredictions.length === 0 ? (
        <p className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          故障予測はまだ実行されていません。
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">予測日時</th>
                <th className="px-4 py-3">故障確率</th>
                <th className="px-4 py-3">予測判定</th>
                <th className="px-4 py-3">モデルバージョン</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sortedPredictions.map((prediction) => (
                <tr key={prediction.id}>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(prediction.predicted_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {(prediction.failure_probability * 100).toFixed(1)}%
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        prediction.predicted_failure
                          ? "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                          : "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                      }
                    >
                      {prediction.predicted_failure
                        ? "故障リスクあり"
                        : "故障リスク低"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {prediction.model_version}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
