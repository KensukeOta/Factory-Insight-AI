"use server";

import { revalidatePath } from "next/cache";

import { createPrediction, createSensorReading } from "@/lib/api";
import type { ProductType, SensorReadingCreate } from "@/lib/api";

export type CreateSensorReadingState = {
  error: string | null;
  success: string | null;
};

function parseNonNegativeNumber(
  value: FormDataEntryValue | null,
): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
}

function parseNonNegativeInteger(
  value: FormDataEntryValue | null,
): number | null {
  const number = parseNonNegativeNumber(value);

  if (number === null || !Number.isInteger(number)) {
    return null;
  }

  return number;
}

export async function createSensorReadingAction(
  machineId: string,
  _previousState: CreateSensorReadingState,
  formData: FormData,
): Promise<CreateSensorReadingState> {
  const productType = formData.get("product_type");

  if (productType !== "L" && productType !== "M" && productType !== "H") {
    return {
      error: "製品種別を正しく選択してください。",
      success: null,
    };
  }

  const airTemperature = parseNonNegativeNumber(
    formData.get("air_temperature"),
  );
  const processTemperature = parseNonNegativeNumber(
    formData.get("process_temperature"),
  );
  const rotationalSpeed = parseNonNegativeInteger(
    formData.get("rotational_speed"),
  );
  const torque = parseNonNegativeNumber(formData.get("torque"));
  const toolWear = parseNonNegativeInteger(formData.get("tool_wear"));

  if (
    airTemperature === null ||
    processTemperature === null ||
    rotationalSpeed === null ||
    rotationalSpeed <= 0 ||
    torque === null ||
    toolWear === null
  ) {
    return {
      error: "センサー値を正しく入力してください。",
      success: null,
    };
  }

  const payload: SensorReadingCreate = {
    product_type: productType as ProductType,
    air_temperature: airTemperature,
    process_temperature: processTemperature,
    rotational_speed: rotationalSpeed,
    torque,
    tool_wear: toolWear,
  };

  try {
    await createSensorReading(machineId, payload);
  } catch {
    return {
      error: "センサーデータを登録できませんでした。",
      success: null,
    };
  }

  revalidatePath(`/machines/${machineId}`);

  return {
    error: null,
    success: "センサーデータを登録しました。",
  };
}

export type CreatePredictionState = {
  error: string | null;
  success: string | null;
};

export async function createPredictionAction(
  machineId: string,
  readingId: string,
  _previousState: CreatePredictionState,
): Promise<CreatePredictionState> {
  void _previousState;

  try {
    await createPrediction(readingId);
  } catch {
    return {
      error: "故障予測を実行できませんでした。",
      success: null,
    };
  }

  revalidatePath(`/machines/${machineId}`);
  revalidatePath("/");

  return {
    error: null,
    success: "故障予測を実行しました。",
  };
}
