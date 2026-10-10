import Link from "next/link";

import type { PredictionWithMachine } from "@/lib/api";

type PredictionHistoryTableProps = {
  predictions: PredictionWithMachine[];
};

export default function PredictionHistoryTable({
  predictions,
}: PredictionHistoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">予測日時</th>
            <th className="px-4 py-3">設備名</th>
            <th className="px-4 py-3">設備種別</th>
            <th className="px-4 py-3">故障確率</th>
            <th className="px-4 py-3">予測判定</th>
            <th className="px-4 py-3">モデル</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {predictions.map((prediction) => (
            <tr key={prediction.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {new Date(prediction.predicted_at).toLocaleString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                })}
              </td>

              <td className="px-4 py-3">
                <Link
                  href={`/machines/${prediction.machine_id}`}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {prediction.machine_name}
                </Link>
              </td>

              <td className="px-4 py-3 text-slate-600">
                {prediction.equipment_type}
              </td>

              <td className="px-4 py-3 font-semibold text-slate-900">
                {(prediction.failure_probability * 100).toFixed(1)}%
              </td>

              <td className="px-4 py-3">
                <span
                  className={
                    prediction.predicted_failure
                      ? "inline-flex whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                      : "inline-flex whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
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
  );
}
