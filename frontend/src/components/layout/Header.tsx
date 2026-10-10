export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
            Equipment Monitoring
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Factory Insight AI
          </h1>
        </div>

        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">
          Predictive Maintenance Dashboard
        </div>
      </div>
    </header>
  );
}
