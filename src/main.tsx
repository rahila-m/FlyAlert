import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './app/router'
import AuthProvider from './features/auth/AuthProvider'
import PreferencesProvider from './features/preferences/PreferencesProvider'
import { registerServiceWorker } from './features/push/push'
import './index.css'

// Background helper that shows phone/browser notifications (public/sw.js).
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PreferencesProvider>
        <RouterProvider router={router} />
      </PreferencesProvider>
    </AuthProvider>
  </StrictMode>,
)
