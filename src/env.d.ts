/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_URL: string;
  readonly VITE_APP_HOST: string;
  readonly VITE_APP_PORT: string;
  readonly VITE_ESLINT_NO_DEV_ERRORS: string;
  readonly VITE_PUBLIC_URL: string;
  readonly VITE_SKIP_PREFLIGHT_CHECK: string;
  readonly VITE_REACT_APP_TINYMCE_APIKEY: string;
  readonly VITE_REACT_APP_GOOGLE_API_KEY: string;
  readonly VITE_EVE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}