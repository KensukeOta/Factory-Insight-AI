import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getMachine } from "@/lib/api";

import SensorReadingForm from "@/components/sensors/SensorReadingForm";
import SensorReadingHistory from "@/components/sensors/SensorReadingHistory";
import PredictionHistory from "@/components/sensors/PredictionHistory";

import MaintenanceRecordForm from "@/components/maintenance/MaintenanceRecordForm";
import MaintenanceRecordHistory from "@/components/maintenance/MaintenanceRecordHistory";

type MachineDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function MachineDetail({ machineId }: { machineId: string }) {
  let machine;

  try {
    machine = await getMachine(machineId);
  } catch {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      >
        設備情報を取得できませんでした。
      </div>
    );
  }

  if (machine === null) {
    notFound();
  }

  const details = [
    { label: "設備名", value: machine.name },
    { label: "設備種別", value: machine.equipment_type },
    {
      label: "稼働状態",
      value: machine.status === "active" ? "稼働中" : machine.status,
    },
    { label: "設備ID", value: machine.id },
    {
      label: "登録日時",
      value: new Date(machine.created_at).toLocaleString("ja-JP", {
        timeZone: "Asia/Tokyo",
      }),
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <dl className="divide-y divide-slate-100">
        {details.map((detail) => (
          <div key={detail.label} className="grid gap-2 py-4 sm:grid-cols-3">
            <dt className="text-sm font-medium text-slate-500">
              {detail.label}
            </dt>

            <dd className="break-all text-sm font-semibold text-slate-900 sm:col-span-2">
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

async function MachineDetailContent({ params }: MachineDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <MachineDetail machineId={id} />

      <SensorReadingForm machineId={id} />

      <Suspense
        fallback={
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
          >
            センサーデータ履歴を読み込み中...
          </div>
        }
      >
        <SensorReadingHistory machineId={id} />
      </Suspense>

      <Suspense
        fallback={
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
          >
            故障予測履歴を読み込み中...
          </div>
        }
      >
        <PredictionHistory machineId={id} />
      </Suspense>

      <MaintenanceRecordForm machineId={id} />

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
        <MaintenanceRecordHistory machineId={id} />
      </Suspense>
    </div>
  );
}

export default function MachineDetailPage({ params }: MachineDetailPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/machines"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 設備一覧に戻る
        </Link>

        <h2 className="mt-5 text-2xl font-bold text-slate-900">設備詳細</h2>
      </div>

      <Suspense
        fallback={
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
          >
            設備情報を読み込み中...
          </div>
        }
      >
        <MachineDetailContent params={params} />
      </Suspense>
    </div>
  );
}
