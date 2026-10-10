import { getHealth } from "@/lib/api";

export default async function ApiStatus() {
  let isConnected = false;

  try {
    const health = await getHealth();
    isConnected = health.status === "ok";
  } catch {
    isConnected = false;
  }

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${
          isConnected ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      <span className="font-medium text-slate-700">
        API接続状態：
        {isConnected ? "接続中" : "接続できません"}
      </span>
    </div>
  );
}
