"use client";

import { useActionState } from "react";

import {
  createSensorReadingAction,
  type CreateSensorReadingState,
} from "@/app/machines/[id]/actions";

const initialState: CreateSensorReadingState = {
  error: null,
  success: null,
};

type SensorReadingFormProps = {
  machineId: string;
};

export default function SensorReadingForm({
  machineId,
}: SensorReadingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createSensorReadingAction.bind(null, machineId),
    initialState,
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        センサーデータ登録
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        設備の測定値を入力してください。
      </p>

      <form action={formAction} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="product_type"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            製品種別
          </label>

          <select
            id="product_type"
            name="product_type"
            required
            disabled={isPending}
            defaultValue="M"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="L">L（Low）</option>
            <option value="M">M（Medium）</option>
            <option value="H">H（High）</option>
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="air_temperature"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              空気温度（K）
            </label>
            <input
              id="air_temperature"
              name="air_temperature"
              type="number"
              step="any"
              min="0"
              required
              disabled={isPending}
              placeholder="298.1"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="process_temperature"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              工程温度（K）
            </label>
            <input
              id="process_temperature"
              name="process_temperature"
              type="number"
              step="any"
              min="0"
              required
              disabled={isPending}
              placeholder="308.6"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="rotational_speed"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              回転速度（rpm）
            </label>
            <input
              id="rotational_speed"
              name="rotational_speed"
              type="number"
              step="1"
              min="1"
              required
              disabled={isPending}
              placeholder="1551"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="torque"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              トルク（Nm）
            </label>
            <input
              id="torque"
              name="torque"
              type="number"
              step="any"
              min="0"
              required
              disabled={isPending}
              placeholder="42.8"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="tool_wear"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              工具摩耗（分）
            </label>
            <input
              id="tool_wear"
              name="tool_wear"
              type="number"
              step="1"
              min="0"
              required
              disabled={isPending}
              placeholder="108"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
          </div>
        </div>

        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        {state.success && (
          <p
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "登録中..." : "センサーデータを登録"}
        </button>
      </form>
    </section>
  );
}
