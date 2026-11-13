import { createBrowserRouter } from 'react-router'
import RootLayout from '../layouts/RootLayout'
import ComingSoonPage from '../pages/ComingSoonPage'
import ErrorPage from '../pages/ErrorPage'
import HomePage from '../pages/HomePage'

// Central list of all pages in the app.
// Each new page (search, dashboard...) gets a new entry in `children`.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // Shown for unknown URLs (404) and for unexpected errors while rendering.
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'login',
        element: (
          <ComingSoonPage
            title="Log in"
            description="Accounts are on the way. You'll be able to log in and manage your price alerts here."
          />
        ),
      },
      {
        path: 'signup',
        element: (
          <ComingSoonPage
            title="Create your account"
            description="Sign up is on the way. Soon you'll be able to create a free account and start tracking fares."
          />
        ),
      },
    ],
  },
])
