"use client";

import { useActionState } from "react";

import { createMachineAction, type CreateMachineState } from "./actions";

const initialState: CreateMachineState = {
  error: null,
};

export default function MachineForm() {
  const [state, formAction, isPending] = useActionState(
    createMachineAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          設備名
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          disabled={isPending}
          placeholder="例：Demo Machine 002"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="equipment_type"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          設備種別
        </label>

        <input
          id="equipment_type"
          name="equipment_type"
          type="text"
          required
          maxLength={100}
          disabled={isPending}
          placeholder="例：CNC Machine"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "登録中..." : "設備を登録"}
      </button>
    </form>
  );
}
