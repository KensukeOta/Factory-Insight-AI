"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type FailureProbabilityChartData = {
  id: string;
  timestamp: number;
  probability: number;
};

type FailureProbabilityLineChartProps = {
  data: FailureProbabilityChartData[];
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default function FailureProbabilityLineChart({
  data,
}: FailureProbabilityLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
        この設備には故障予測履歴がありません。
      </div>
    );
  }

  return (
    <div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 25, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value: number) =>
                dateFormatter.format(new Date(value))
              }
              tick={{ fontSize: 11 }}
              minTickGap={25}
            />

            <YAxis
              domain={[
                0,
                (dataMax: number) =>
                  dataMax === 0
                    ? 1
                    : Math.min(100, Math.max(0.01, dataMax * 1.25)),
              ]}
              tickFormatter={(value: number) => `${Number(value.toFixed(2))}%`}
              tick={{ fontSize: 12 }}
              width={55}
            />

            <Tooltip
              labelFormatter={(value) =>
                dateFormatter.format(new Date(Number(value)))
              }
              formatter={(value) => [
                `${Number(value ?? 0).toFixed(2)}%`,
                "故障確率",
              ]}
            />

            <Line
              type="monotone"
              dataKey="probability"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        ※ 縦軸は表示中の故障確率に合わせて調整しています。
        100%固定ではありません。
      </p>
    </div>
  );
}
