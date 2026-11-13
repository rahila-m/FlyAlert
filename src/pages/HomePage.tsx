// Temporary home page. It will become the full landing page in a later step.
export default function HomePage() {
  return (
    <section className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
          Setup check
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">FlyAlert</h1>
        <p className="mt-3 text-slate-600">
          Tailwind CSS and React Router are working.
        </p>
      </div>
    </section>
  )
}
