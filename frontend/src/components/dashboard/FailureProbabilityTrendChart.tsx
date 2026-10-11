"use client";

import { useMemo, useState } from "react";

import FailureProbabilityLineChart, {
  type FailureProbabilityChartData,
} from "@/components/dashboard/FailureProbabilityLineChart";

import type { Machine, PredictionWithMachine } from "@/lib/api";

type FailureProbabilityTrendChartProps = {
  machines: Machine[];
  predictions: PredictionWithMachine[];
};

export default function FailureProbabilityTrendChart({
  machines,
  predictions,
}: FailureProbabilityTrendChartProps) {
  const availableMachines = useMemo(
    () =>
      machines.filter((machine) =>
        predictions.some((prediction) => prediction.machine_id === machine.id),
      ),
    [machines, predictions],
  );

  const [selectedMachineId, setSelectedMachineId] = useState(
    availableMachines[0]?.id ?? "",
  );

  const chartData = useMemo<FailureProbabilityChartData[]>(
    () =>
      predictions
        .filter((prediction) => prediction.machine_id === selectedMachineId)
        .map((prediction) => ({
          id: prediction.id,
          timestamp: new Date(prediction.predicted_at).getTime(),
          probability: prediction.failure_probability * 100,
        }))
        .sort((a, b) => a.timestamp - b.timestamp),
    [predictions, selectedMachineId],
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            故障確率の推移
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            設備ごとの故障確率の変化を時系列で表示
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label
            htmlFor="trend-machine-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            設備を選択
          </label>

          <select
            id="trend-machine-filter"
            value={selectedMachineId}
            onChange={(event) => setSelectedMachineId(event.target.value)}
            disabled={availableMachines.length === 0}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 disabled:bg-slate-100"
          >
            {availableMachines.length === 0 ? (
              <option value="">予測履歴のある設備がありません</option>
            ) : (
              availableMachines.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <FailureProbabilityLineChart data={chartData} />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        表示中の予測件数：{chartData.length}件
      </p>
    </section>
  );
}
