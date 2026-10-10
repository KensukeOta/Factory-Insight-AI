"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createMachine } from "@/lib/api";

export type CreateMachineState = {
  error: string | null;
};

export async function createMachineAction(
  _previousState: CreateMachineState,
  formData: FormData,
): Promise<CreateMachineState> {
  const name = formData.get("name");
  const equipmentType = formData.get("equipment_type");

  if (typeof name !== "string" || typeof equipmentType !== "string") {
    return { error: "入力内容を確認してください。" };
  }

  const trimmedName = name.trim();
  const trimmedEquipmentType = equipmentType.trim();

  if (!trimmedName || !trimmedEquipmentType) {
    return { error: "すべての項目を入力してください。" };
  }

  if (trimmedName.length > 100 || trimmedEquipmentType.length > 100) {
    return {
      error: "各項目は100文字以内で入力してください。",
    };
  }

  let machineId: string;

  try {
    const machine = await createMachine({
      name: trimmedName,
      equipment_type: trimmedEquipmentType,
    });

    machineId = machine.id;
  } catch {
    return {
      error: "設備を登録できませんでした。時間をおいて再試行してください。",
    };
  }

  revalidatePath("/machines");
  revalidatePath("/");

  redirect(`/machines/${machineId}`);
}
