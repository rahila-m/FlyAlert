// Temporary page to verify Tailwind CSS is working.
// It will be replaced by the real landing page in the next steps.
function App() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
          Setup check
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">FlyAlert</h1>
        <p className="mt-3 text-slate-600">
          Tailwind CSS is installed and working.
        </p>
      </div>
    </main>
  )
}

export default App
