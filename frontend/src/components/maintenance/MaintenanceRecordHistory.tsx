import { getMaintenanceRecords } from "@/lib/api";

type MaintenanceRecordHistoryProps = {
  machineId: string;
};

export default async function MaintenanceRecordHistory({
  machineId,
}: MaintenanceRecordHistoryProps) {
  let records;

  try {
    records = await getMaintenanceRecords(machineId);
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        メンテナンス履歴を取得できませんでした。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          メンテナンス履歴
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          登録件数：{records.length}件
        </p>
      </div>

      {records.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-500">
          メンテナンス記録はまだありません。
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {records.map((record) => (
            <div key={record.id} className="px-6 py-5">
              <p className="text-xs text-slate-500">
                {new Date(record.performed_at).toLocaleString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                {record.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
