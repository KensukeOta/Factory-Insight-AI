"use client";

import { useActionState } from "react";

import {
  createPredictionAction,
  type CreatePredictionState,
} from "@/app/machines/[id]/actions";

type PredictionButtonProps = {
  machineId: string;
  readingId: string;
};

const initialState: CreatePredictionState = {
  error: null,
  success: null,
};

export default function PredictionButton({
  machineId,
  readingId,
}: PredictionButtonProps) {
  const [state, formAction, isPending] = useActionState(
    createPredictionAction.bind(null, machineId, readingId),
    initialState,
  );

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "予測中..." : "故障予測を実行"}
        </button>
      </form>

      {state.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}

      {state.success && (
        <p role="status" className="text-xs text-emerald-700">
          {state.success}
        </p>
      )}
    </div>
  );
}
