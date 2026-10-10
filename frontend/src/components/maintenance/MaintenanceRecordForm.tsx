"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  registerMaintenanceAction,
  type MaintenanceFormState,
} from "@/app/machines/[id]/actions";

type MaintenanceRecordFormProps = {
  machineId: string;
};

const initialState: MaintenanceFormState = {
  success: false,
  message: "",
};

export default function MaintenanceRecordForm({
  machineId,
}: MaintenanceRecordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    registerMaintenanceAction.bind(null, machineId),
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        メンテナンス記録の登録
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        点検・修理・部品交換などの作業内容を記録できます。
      </p>

      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="maintenance-description"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            作業内容
          </label>

          <textarea
            id="maintenance-description"
            name="description"
            required
            minLength={1}
            maxLength={2000}
            rows={5}
            placeholder="例：定期点検を実施。フィルター清掃と動作確認を行った。"
            disabled={isPending}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
          />

          <p className="mt-1 text-xs text-slate-500">
            1〜2000文字で入力してください。
          </p>
        </div>

        {state.message && (
          <p
            role="status"
            className={`rounded-lg px-4 py-3 text-sm ${
              state.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "登録中..." : "メンテナンス記録を登録"}
        </button>
      </form>
    </div>
  );
}
