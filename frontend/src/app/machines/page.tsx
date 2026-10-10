import Link from "next/link";
import { Suspense } from "react";

import { getMachines } from "@/lib/api";

async function MachineList() {
  let machines;

  try {
    machines = await getMachines();
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        設備一覧を取得できませんでした。
      </div>
    );
  }

  if (machines.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        登録されている設備はありません。
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="px-6 py-4">
                設備名
              </th>
              <th scope="col" className="px-6 py-4">
                設備種別
              </th>
              <th scope="col" className="px-6 py-4">
                稼働状態
              </th>
              <th scope="col" className="px-6 py-4">
                詳細
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {machines.map((machine) => (
              <tr key={machine.id}>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {machine.name}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {machine.equipment_type}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      machine.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {machine.status === "active" ? "稼働中" : machine.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <Link
                    href={`/machines/${machine.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    詳細を見る
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MachinesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">設備管理</h2>
          <p className="mt-2 text-sm text-slate-500">
            登録済みの設備を一覧で確認できます。
          </p>
        </div>

        <Link
          href="/machines/new"
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          + 設備を登録
        </Link>
      </div>

      <Suspense
        fallback={
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
          >
            設備一覧を読み込み中...
          </div>
        }
      >
        <MachineList />
      </Suspense>
    </div>
  );
}
