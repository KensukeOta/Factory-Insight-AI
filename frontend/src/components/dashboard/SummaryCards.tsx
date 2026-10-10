import { getDashboardSummary } from "@/lib/api";
import type { DashboardSummary } from "@/lib/api";

export default async function SummaryCards() {
  let summary: DashboardSummary;

  try {
    summary = await getDashboardSummary();
  } catch {
    return (
      <section
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        設備サマリーを取得できませんでした。
      </section>
    );
  }

  const cards = [
    {
      label: "登録設備数",
      value: summary.total_machines,
      description: "管理対象の設備",
    },
    {
      label: "稼働中設備",
      value: summary.active_machines,
      description: "現在稼働中の設備",
    },
    {
      label: "高リスク設備",
      value: summary.high_risk_machines,
      description: "最新の故障予測に基づく判定",
    },
    {
      label: "累計予測回数",
      value: summary.total_predictions,
      description: "保存済みの故障予測結果",
    },
  ];

  return (
    <section
      aria-label="設備サマリー"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {card.value.toLocaleString("ja-JP")}
          </p>

          <p className="mt-3 text-xs text-slate-400">{card.description}</p>
        </div>
      ))}
    </section>
  );
}
