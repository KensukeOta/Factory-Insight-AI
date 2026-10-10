import Link from "next/link";

import MachineForm from "./MachineForm";

export default function NewMachinePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/machines"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← 設備一覧に戻る
        </Link>

        <h2 className="mt-5 text-2xl font-bold text-slate-900">設備を登録</h2>

        <p className="mt-2 text-sm text-slate-500">
          新しく管理する設備の情報を入力してください。
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <MachineForm />
      </div>
    </div>
  );
}
