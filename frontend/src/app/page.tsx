import { Suspense } from "react";

import ApiStatus from "@/components/dashboard/ApiStatus";

const summaryCards = [
  {
    label: "登録設備数",
    value: "—",
    description: "管理対象の設備",
  },
  {
    label: "稼働中設備",
    value: "—",
    description: "現在稼働中の設備",
  },
  {
    label: "高リスク設備",
    value: "—",
    description: "最新の故障予測に基づく判定",
  },
  {
    label: "累計予測回数",
    value: "—",
    description: "保存済みの故障予測結果",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">ダッシュボード</h2>
          <p className="mt-2 text-sm text-slate-500">
            設備の稼働状況と故障リスクを確認できます。
          </p>
        </div>

        <Suspense
          fallback={
            <div
              role="status"
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
            >
              API接続状態：確認中...
            </div>
          }
        >
          <ApiStatus />
        </Suspense>
      </section>

      <section
        aria-label="設備サマリー"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              {card.value}
            </p>
            <p className="mt-3 text-xs text-slate-400">{card.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">
              高リスク設備
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              故障リスクの高い設備を確認します。
            </p>
          </div>

          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-400">
              API接続後に設備一覧を表示します。
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">
              直近の故障予測
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              最新の予測履歴を確認します。
            </p>
          </div>

          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-400">
              API接続後に予測履歴を表示します。
            </p>
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-400">
        ※ 本サービスはAI4I 2020の合成データを利用した
        ポートフォリオアプリケーションです。
      </p>
    </div>
  );
}
