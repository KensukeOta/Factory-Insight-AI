"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type MachineRiskChartData = {
  machineId: string;
  machineName: string;
  probability: number;
  predictedFailure: boolean;
};

type MachineRiskBarChartProps = {
  data: MachineRiskChartData[];
};

export default function MachineRiskBarChart({
  data,
}: MachineRiskBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
        故障予測データがありません。
      </div>
    );
  }

  const maxProbability = Math.max(...data.map((item) => item.probability));

  const axisMax =
    maxProbability === 0
      ? 1
      : Math.min(100, Math.max(0.01, maxProbability * 1.25));

  return (
    <div>
      <div
        className="w-full"
        style={{ height: Math.max(288, data.length * 52 + 60) }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 65, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />

            <XAxis
              type="number"
              domain={[0, axisMax]}
              tickFormatter={(value: number) => `${Number(value.toFixed(2))}%`}
              tick={{ fontSize: 11 }}
            />

            <YAxis
              type="category"
              dataKey="machineName"
              width={110}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              formatter={(value) => [
                `${Number(value ?? 0).toFixed(4)}%`,
                "故障確率",
              ]}
            />

            <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.machineId}
                  fill={entry.predictedFailure ? "#dc2626" : "#059669"}
                />
              ))}

              <LabelList
                dataKey="probability"
                position="right"
                formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`}
                style={{ fontSize: 11, fill: "#475569" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        ※ 横軸は表示中の最大故障確率に合わせて調整しています。
        100%固定ではありません。
      </p>
    </div>
  );
}
