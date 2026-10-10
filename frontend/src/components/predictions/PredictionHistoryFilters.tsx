"use client";

import { useMemo, useState } from "react";

import PredictionHistoryTable from "@/components/predictions/PredictionHistoryTable";
import type { Machine, PredictionWithMachine } from "@/lib/api";

type PredictionHistoryFiltersProps = {
  machines: Machine[];
  predictions: PredictionWithMachine[];
};

type RiskFilter = "all" | "high" | "low";

export default function PredictionHistoryFilters({
  machines,
  predictions,
}: PredictionHistoryFiltersProps) {
  const [selectedMachineId, setSelectedMachineId] = useState("all");

  const [selectedRisk, setSelectedRisk] = useState<RiskFilter>("all");

  const filteredPredictions = useMemo(() => {
    return predictions.filter((prediction) => {
      const matchesMachine =
        selectedMachineId === "all" ||
        prediction.machine_id === selectedMachineId;

      const matchesRisk =
        selectedRisk === "all" ||
        (selectedRisk === "high" && prediction.predicted_failure) ||
        (selectedRisk === "low" && !prediction.predicted_failure);

      return matchesMachine && matchesRisk;
    });
  }, [predictions, selectedMachineId, selectedRisk]);

  function resetFilters() {
    setSelectedMachineId("all");
    setSelectedRisk("all");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="machine-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              設備
            </label>

            <select
              id="machine-filter"
              value={selectedMachineId}
              onChange={(event) => setSelectedMachineId(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
            >
              <option value="all">すべての設備</option>

              {machines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="risk-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              リスク判定
            </label>

            <select
              id="risk-filter"
              value={selectedRisk}
              onChange={(event) =>
                setSelectedRisk(event.target.value as RiskFilter)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
            >
              <option value="all">すべて</option>
              <option value="high">故障リスクあり</option>
              <option value="low">故障リスク低</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {filteredPredictions.length}件の予測結果
          </p>

          <button
            type="button"
            onClick={resetFilters}
            disabled={selectedMachineId === "all" && selectedRisk === "all"}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            条件をリセット
          </button>
        </div>
      </div>

      {filteredPredictions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {predictions.length === 0
            ? "故障予測履歴はまだありません。設備詳細画面から故障予測を実行してください。"
            : "条件に一致する予測履歴がありません。"}
        </div>
      ) : (
        <PredictionHistoryTable predictions={filteredPredictions} />
      )}
    </div>
  );
}
