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
