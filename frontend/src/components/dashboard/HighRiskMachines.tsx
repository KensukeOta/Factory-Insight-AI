import { getHighRiskMachines } from "@/lib/api";
import type { HighRiskMachine } from "@/lib/api";
import { formatProbability } from "@/lib/format";

export default async function HighRiskMachines() {
  let machines: HighRiskMachine[];

  try {
    machines = await getHighRiskMachines();
  } catch {
    return (
      <section
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        高リスク設備の情報を取得できませんでした。
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">高リスク設備</h3>

      <p className="mt-1 text-sm text-slate-500">
        最新の予測で故障リスクが高いと判定された設備
      </p>

      {machines.length === 0 ? (
        <p className="mt-6 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          高リスクと判定された設備はありません。
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {machines.map((machine) => (
            <div
              key={machine.machine_id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {machine.machine_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {machine.equipment_type}
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                  {formatProbability(machine.failure_probability)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
