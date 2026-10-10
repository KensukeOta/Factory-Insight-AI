import { getSensorReadings } from "@/lib/api";
import type { SensorReading } from "@/lib/api";

import PredictionButton from "@/components/sensors/PredictionButton";

type SensorReadingHistoryProps = {
  machineId: string;
};

export default async function SensorReadingHistory({
  machineId,
}: SensorReadingHistoryProps) {
  let readings: SensorReading[];

  try {
    readings = await getSensorReadings(machineId);
  } catch {
    return (
      <section
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        センサーデータ履歴を取得できませんでした。
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        センサーデータ履歴
      </h3>

      {readings.length === 0 ? (
        <p className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          センサーデータはまだ登録されていません。
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">測定日時</th>
                <th className="px-4 py-3">製品種別</th>
                <th className="px-4 py-3">空気温度</th>
                <th className="px-4 py-3">工程温度</th>
                <th className="px-4 py-3">回転速度</th>
                <th className="px-4 py-3">トルク</th>
                <th className="px-4 py-3">工具摩耗</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {readings.map((reading) => (
                <tr key={reading.id}>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(reading.measured_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </td>
                  <td className="px-4 py-3">{reading.product_type}</td>
                  <td className="px-4 py-3">{reading.air_temperature} K</td>
                  <td className="px-4 py-3">{reading.process_temperature} K</td>
                  <td className="px-4 py-3">{reading.rotational_speed} rpm</td>
                  <td className="px-4 py-3">{reading.torque} Nm</td>
                  <td className="px-4 py-3">{reading.tool_wear} 分</td>
                  <td className="px-4 py-3">
                    <PredictionButton
                      machineId={machineId}
                      readingId={reading.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
