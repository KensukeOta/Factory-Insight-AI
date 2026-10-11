"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type FailureRiskDonutChartProps = {
  highRiskCount: number;
  lowRiskCount: number;
};

const COLORS = {
  high: "#dc2626",
  low: "#059669",
};

export default function FailureRiskDonutChart({
  highRiskCount,
  lowRiskCount,
}: FailureRiskDonutChartProps) {
  const total = highRiskCount + lowRiskCount;

  if (total === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
        故障予測データがありません。
      </div>
    );
  }

  const data = [
    {
      name: "故障リスクあり",
      value: highRiskCount,
      color: COLORS.high,
    },
    {
      name: "故障リスク低",
      value: lowRiskCount,
      color: COLORS.low,
    },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value, name) => {
              const count = Number(value ?? 0);
              const percentage = ((count / total) * 100).toFixed(1);

              return [`${count}件 (${percentage}%)`, String(name)];
            }}
          />

          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
