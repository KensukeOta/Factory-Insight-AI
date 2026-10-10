const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export type HealthResponse = {
  status: string;
};

export type DashboardSummary = {
  total_machines: number;
  active_machines: number;
  high_risk_machines: number;
  total_predictions: number;
};

export type HighRiskMachine = {
  machine_id: string;
  machine_name: string;
  equipment_type: string;
  failure_probability: number;
  predicted_at: string;
};

export type RecentPrediction = {
  id: string;
  machine_id: string;
  machine_name: string;
  failure_probability: number;
  predicted_failure: boolean;
  predicted_at: string;
};

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${path} (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function getHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>("/health");
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchApi<DashboardSummary>("/api/dashboard/summary");
}

export async function getHighRiskMachines(): Promise<HighRiskMachine[]> {
  return fetchApi<HighRiskMachine[]>("/api/dashboard/high-risk-machines");
}

export async function getRecentPredictions(): Promise<RecentPrediction[]> {
  return fetchApi<RecentPrediction[]>("/api/dashboard/recent-predictions");
}

export type Machine = {
  id: string;
  name: string;
  equipment_type: string;
  status: string;
  created_at: string;
};

export type MachineCreate = {
  name: string;
  equipment_type: string;
};

export async function getMachines(): Promise<Machine[]> {
  return fetchApi<Machine[]>("/api/machines");
}

export async function getMachine(machineId: string): Promise<Machine | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/machines/${encodeURIComponent(machineId)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch machine: ${response.status}`);
  }

  return (await response.json()) as Machine;
}

export async function createMachine(payload: MachineCreate): Promise<Machine> {
  const response = await fetch(`${API_BASE_URL}/api/machines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Failed to create machine: ${response.status}`);
  }

  return (await response.json()) as Machine;
}

export type ProductType = "L" | "M" | "H";

export type SensorReadingCreate = {
  product_type: ProductType;
  air_temperature: number;
  process_temperature: number;
  rotational_speed: number;
  torque: number;
  tool_wear: number;
};

export type SensorReading = SensorReadingCreate & {
  id: string;
  machine_id: string;
  measured_at: string;
};

export type Prediction = {
  id: string;
  machine_id: string;
  sensor_reading_id: string;
  failure_probability: number;
  predicted_failure: boolean;
  model_version: string;
  predicted_at: string;
};

export async function getSensorReadings(
  machineId: string,
): Promise<SensorReading[]> {
  return fetchApi<SensorReading[]>(
    `/api/machines/${encodeURIComponent(machineId)}/readings`,
  );
}

export async function createSensorReading(
  machineId: string,
  payload: SensorReadingCreate,
): Promise<SensorReading> {
  const response = await fetch(
    `${API_BASE_URL}/api/machines/${encodeURIComponent(machineId)}/readings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create sensor reading: ${response.status}`);
  }

  return (await response.json()) as SensorReading;
}

export async function getPredictions(machineId: string): Promise<Prediction[]> {
  return fetchApi<Prediction[]>(
    `/api/machines/${encodeURIComponent(machineId)}/predictions`,
  );
}

export async function createPrediction(readingId: string): Promise<Prediction> {
  const response = await fetch(
    `${API_BASE_URL}/api/readings/${encodeURIComponent(readingId)}/predict`,
    {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to create prediction: ${response.status}`);
  }

  return (await response.json()) as Prediction;
}
