import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export default function ErrorPage() {
  const error = useRouteError()
  const isNotFound = isRouteErrorResponse(error) && error.status === 404

  // Log unexpected errors for debugging; never show technical details to users.
  if (!isNotFound) console.error(error)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
        {isNotFound ? '404' : 'Error'}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        {isNotFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        {isNotFound
          ? "The page you're looking for doesn't exist or has been moved."
          : 'An unexpected error occurred. Please try again.'}
      </p>
      <Link
        to="/"
        className="mt-8 rounded-lg bg-sky-600 px-5 py-2.5 font-medium text-white transition hover:bg-sky-700"
      >
        Back to home
      </Link>
    </div>
  )
}
