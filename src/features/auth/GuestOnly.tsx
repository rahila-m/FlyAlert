import { Navigate, Outlet, useSearchParams } from 'react-router'
import PageLoader from '../../components/ui/PageLoader'
import { useAuth } from './auth-context'
import { getSafeRedirect } from './redirect'

// Wraps pages only meant for logged-out visitors (login, sign up, forgot password).
// As soon as a session exists (after logging in, or after clicking the email
// confirmation link) the user is sent on to the dashboard or ?redirect= target.
export default function GuestOnly() {
  const { user, isLoading } = useAuth()
  const [searchParams] = useSearchParams()

  if (isLoading) return <PageLoader />
  if (user) return <Navigate to={getSafeRedirect(searchParams.get('redirect'))} replace />
  return <Outlet />
}
