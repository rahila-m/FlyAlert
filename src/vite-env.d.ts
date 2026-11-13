/// <reference types="vite/client" />

// Types for our environment variables, so import.meta.env.* is checked by TypeScript.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
