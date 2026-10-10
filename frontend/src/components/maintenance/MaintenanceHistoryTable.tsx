import Link from "next/link";

import type { MaintenanceRecordWithMachine } from "@/lib/api";

type MaintenanceHistoryTableProps = {
  records: MaintenanceRecordWithMachine[];
};

export default function MaintenanceHistoryTable({
  records,
}: MaintenanceHistoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-4 text-left font-semibold text-slate-600">
              実施日時
            </th>

            <th className="px-5 py-4 text-left font-semibold text-slate-600">
              設備名
            </th>

            <th className="px-5 py-4 text-left font-semibold text-slate-600">
              設備種別
            </th>

            <th className="px-5 py-4 text-left font-semibold text-slate-600">
              作業内容
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                {new Date(record.performed_at).toLocaleString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>

              <td className="px-5 py-4">
                <Link
                  href={`/machines/${record.machine_id}`}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {record.machine_name}
                </Link>
              </td>

              <td className="px-5 py-4 text-slate-600">
                {record.equipment_type}
              </td>

              <td className="min-w-64 px-5 py-4">
                <p className="whitespace-pre-wrap break-words leading-6 text-slate-800">
                  {record.description}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
