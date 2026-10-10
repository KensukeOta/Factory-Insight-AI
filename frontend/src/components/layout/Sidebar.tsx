"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "ダッシュボード", href: "/" },
  { label: "設備管理", href: "/machines" },
  { label: "予測履歴", href: "/predictions" },
  { label: "メンテナンス", href: "/maintenance" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-slate-800 bg-slate-950 text-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="border-b border-slate-800 px-6 py-6">
        <Link href="/" className="block">
          <span className="text-lg font-bold tracking-tight">
            Factory Insight AI
          </span>
          <span className="mt-1 block text-xs text-slate-400">
            Predictive Maintenance
          </span>
        </Link>
      </div>

      <nav aria-label="メインナビゲーション" className="p-4">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden px-6 py-4 text-xs text-slate-500 md:block">
        AI-powered Equipment Monitoring
      </div>
    </aside>
  );
}
