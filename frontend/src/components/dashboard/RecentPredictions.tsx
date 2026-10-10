import { getRecentPredictions } from "@/lib/api";
import type { RecentPrediction } from "@/lib/api";
import { formatProbability } from "@/lib/format";

export default async function RecentPredictions() {
  let predictions: RecentPrediction[];

  try {
    predictions = await getRecentPredictions();
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">直近の故障予測</h3>

      <p className="mt-1 text-sm text-slate-500">最新10件の故障予測履歴</p>

      {predictions.length === 0 ? (
        <p className="mt-6 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          予測履歴はまだありません。
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {prediction.machine_name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {new Date(prediction.predicted_at).toLocaleString("ja-JP", {
                    timeZone: "Asia/Tokyo",
                  })}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    prediction.predicted_failure
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {prediction.predicted_failure ? "高リスク" : "低リスク"}
                </span>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {formatProbability(prediction.failure_probability)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
