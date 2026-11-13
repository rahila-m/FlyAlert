import { createBrowserRouter } from 'react-router'
import GuestOnly from '../features/auth/GuestOnly'
import RequireAuth from '../features/auth/RequireAuth'
import RootLayout from '../layouts/RootLayout'
import AccountPage from '../pages/AccountPage'
import DashboardPage from '../pages/DashboardPage'
import ErrorPage from '../pages/ErrorPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import SearchPage from '../pages/SearchPage'
import SignUpPage from '../pages/SignUpPage'

// Central list of all pages in the app.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // Shown for unknown URLs (404) and for unexpected errors while rendering.
    errorElement: <ErrorPage />,
    children: [
      // Public pages
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },

      // Only for logged-out visitors (logged-in users are redirected to the dashboard)
      {
        element: <GuestOnly />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignUpPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
        ],
      },

      // Only for logged-in users (visitors are redirected to /login)
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'account', element: <AccountPage /> },
        ],
      },
    ],
  },
])
