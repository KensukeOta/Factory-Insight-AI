import { Suspense } from "react";

import ApiStatus from "@/components/dashboard/ApiStatus";
import HighRiskMachines from "@/components/dashboard/HighRiskMachines";
import RecentPredictions from "@/components/dashboard/RecentPredictions";
import SummaryCards from "@/components/dashboard/SummaryCards";

function LoadingCard() {
  return (
    <div
      role="status"
      className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
    >
      データを読み込み中...
    </div>
  );
}

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

        <Suspense fallback={<LoadingCard />}>
          <ApiStatus />
        </Suspense>
      </section>

      <Suspense fallback={<LoadingCard />}>
        <SummaryCards />
      </Suspense>

      <div className="grid gap-6 xl:grid-cols-2">
        <Suspense fallback={<LoadingCard />}>
          <HighRiskMachines />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <RecentPredictions />
        </Suspense>
      </div>

      <p className="text-xs text-slate-400">
        ※ 本サービスはAI4I 2020の合成データを利用した
        ポートフォリオアプリケーションです。
      </p>
    </div>
  );
}
