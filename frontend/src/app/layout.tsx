import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import "./globals.css";

export const metadata: Metadata = {
  title: "Factory Insight AI",
  description: "機械学習による設備故障予測と予防保全を支援するダッシュボード",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 antialiased">
        <div className="min-h-screen md:flex">
          <Suspense
            fallback={
              <aside
                aria-label="ナビゲーションを読み込み中"
                className="w-full shrink-0 border-b border-slate-800 bg-slate-950 md:min-h-screen md:w-64 md:border-b-0 md:border-r"
              />
            }
          >
            <Sidebar />
          </Suspense>

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />

            <main className="flex-1 px-5 py-8 sm:px-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
