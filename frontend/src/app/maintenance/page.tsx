import { Suspense } from "react";

import MaintenanceHistoryFilters from "@/components/maintenance/MaintenanceHistoryFilters";

import {
  getAllMaintenanceRecords,
  type AllMaintenanceRecordsResult,
} from "@/lib/api";

async function MaintenanceHistoryContent() {
  let result: AllMaintenanceRecordsResult;

  try {
    result = await getAllMaintenanceRecords();
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        メンテナンス履歴を取得できませんでした。
        FastAPIが起動しているか確認してください。
      </div>
    );
  }

  const { machines, records } = result;

  const totalRecords = records.length;

  const maintainedMachineCount = new Set(
    records.map((record) => record.machine_id),
  ).size;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">総メンテナンス件数</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalRecords}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">メンテナンス実施設備数</p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {maintainedMachineCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">登録設備数</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {machines.length}
          </p>
        </div>
      </div>

      <MaintenanceHistoryFilters machines={machines} records={records} />
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">メンテナンス履歴</h2>

        <p className="mt-2 text-sm text-slate-500">
          全設備の点検・修理・部品交換などの作業履歴を確認できます。
        </p>
      </div>

      <Suspense
        fallback={
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
          >
            メンテナンス履歴を読み込み中...
          </div>
        }
      >
        <MaintenanceHistoryContent />
      </Suspense>
    </div>
  );
}
