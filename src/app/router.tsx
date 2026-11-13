import { createBrowserRouter } from 'react-router'
import RootLayout from '../layouts/RootLayout'
import ErrorPage from '../pages/ErrorPage'
import HomePage from '../pages/HomePage'

// Central list of all pages in the app.
// Each new page (search, login, dashboard...) gets a new entry in `children`.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // Shown for unknown URLs (404) and for unexpected errors while rendering.
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <HomePage /> }],
  },
])
