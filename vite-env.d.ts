/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HEYGEN_API_KEY: string
  readonly VITE_HEYGEN_AVATAR_ID: string
  readonly VITE_HEYGEN_VOICE_ID: string
  readonly VITE_CLAUDE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
