import { createBrowserRouter } from 'react-router'
import PageLoader from '../components/ui/PageLoader'
import GuestOnly from '../features/auth/GuestOnly'
import RequireAuth from '../features/auth/RequireAuth'
import RootLayout from '../layouts/RootLayout'
import ErrorPage from '../pages/ErrorPage'
import HomePage from '../pages/HomePage'

// Loads a page's code only when someone visits it ("code splitting"),
// so the first visit to the landing page downloads less JavaScript.
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
})

// Central list of all pages in the app.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // Shown for unknown URLs (404) and for unexpected errors while rendering.
    errorElement: <ErrorPage />,
    // Shown while a page's code is downloading on the very first visit.
    hydrateFallbackElement: <PageLoader />,
    children: [
      // Public pages (the landing page is included in the main bundle)
      { index: true, element: <HomePage /> },
      { path: 'search', lazy: page(() => import('../pages/SearchPage')) },
      { path: 'reset-password', lazy: page(() => import('../pages/ResetPasswordPage')) },
      { path: 'privacy', lazy: page(() => import('../pages/PrivacyPage')) },
      { path: 'terms', lazy: page(() => import('../pages/TermsPage')) },

      // Only for logged-out visitors (logged-in users are redirected to the dashboard)
      {
        element: <GuestOnly />,
        children: [
          { path: 'login', lazy: page(() => import('../pages/LoginPage')) },
          { path: 'signup', lazy: page(() => import('../pages/SignUpPage')) },
          { path: 'forgot-password', lazy: page(() => import('../pages/ForgotPasswordPage')) },
        ],
      },

      // Only for logged-in users (visitors are redirected to /login)
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', lazy: page(() => import('../pages/DashboardPage')) },
          { path: 'account', lazy: page(() => import('../pages/AccountPage')) },
        ],
      },
    ],
  },
])
