/// <reference types="vite/client" />

// Types for our environment variables, so import.meta.env.* is checked by TypeScript.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  // Optional: set to "demo" to use generated demo flights instead of the API.
  readonly VITE_FLIGHT_DATA_SOURCE?: 'api' | 'demo'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
