import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './app/router'
import AuthProvider from './features/auth/AuthProvider'
import PreferencesProvider from './features/preferences/PreferencesProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PreferencesProvider>
        <RouterProvider router={router} />
      </PreferencesProvider>
    </AuthProvider>
  </StrictMode>,
)
