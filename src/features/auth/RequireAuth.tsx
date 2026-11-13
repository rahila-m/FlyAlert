import { Navigate, Outlet, useLocation } from 'react-router'
import PageLoader from '../../components/ui/PageLoader'
import { useAuth } from './auth-context'

// Wraps pages that need a logged-in user (dashboard, alerts, profile).
// Visitors are sent to /login and brought back here afterwards.
//
// This is for user experience only. Real protection happens in the database
// (Row Level Security): even without this component, a visitor could not read
// anyone's data.
export default function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return <Outlet />
}
