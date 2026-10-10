"use client";

import { useMemo, useState } from "react";

import MaintenanceHistoryTable from "@/components/maintenance/MaintenanceHistoryTable";

import type { Machine, MaintenanceRecordWithMachine } from "@/lib/api";

type MaintenanceHistoryFiltersProps = {
  machines: Machine[];
  records: MaintenanceRecordWithMachine[];
};

export default function MaintenanceHistoryFilters({
  machines,
  records,
}: MaintenanceHistoryFiltersProps) {
  const [selectedMachineId, setSelectedMachineId] = useState("all");

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          selectedMachineId === "all" ||
          record.machine_id === selectedMachineId,
      ),
    [records, selectedMachineId],
  );

  function resetFilters() {
    setSelectedMachineId("all");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="max-w-md">
          <label
            htmlFor="maintenance-machine-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            設備
          </label>

          <select
            id="maintenance-machine-filter"
            value={selectedMachineId}
            onChange={(event) => setSelectedMachineId(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
          >
            <option value="all">すべての設備</option>

            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {filteredRecords.length}件のメンテナンス記録
          </p>

          <button
            type="button"
            onClick={resetFilters}
            disabled={selectedMachineId === "all"}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            条件をリセット
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {records.length === 0
            ? "メンテナンス記録はまだありません。設備詳細画面から登録してください。"
            : "条件に一致するメンテナンス記録がありません。"}
        </div>
      ) : (
        <MaintenanceHistoryTable records={filteredRecords} />
      )}
    </div>
  );
}
