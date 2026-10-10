import { Suspense } from "react";

import PredictionHistoryFilters from "@/components/predictions/PredictionHistoryFilters";
import { getAllPredictions, type AllPredictionsResult } from "@/lib/api";

async function PredictionHistoryContent() {
  let result: AllPredictionsResult;

  try {
    result = await getAllPredictions();
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        故障予測履歴を取得できませんでした。
        FastAPIが起動しているか確認してください。
      </div>
    );
  }

  const { machines, predictions } = result;

  const totalPredictions = predictions.length;

  const highRiskCount = predictions.filter(
    (prediction) => prediction.predicted_failure,
  ).length;

  const lowRiskCount = totalPredictions - highRiskCount;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">総予測件数</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalPredictions}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">故障リスクあり</p>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {highRiskCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">故障リスク低</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {lowRiskCount}
          </p>
        </div>
      </div>

      <PredictionHistoryFilters machines={machines} predictions={predictions} />
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">故障予測履歴</h2>

        <p className="mt-2 text-sm text-slate-500">
          全設備のAI故障予測結果を確認できます。
        </p>
      </div>

      <Suspense
        fallback={
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
          >
            故障予測履歴を読み込み中...
          </div>
        }
      >
        <PredictionHistoryContent />
      </Suspense>
    </div>
  );
}
