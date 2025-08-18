/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVE_BACKEND_URL: string;
  readonly VITE_REACT_APP_TINYMCE_APIKEY: string;
  readonly VITE_REACT_APP_GOOGLE_API_KEY: string;
  readonly VITE_APP_PORT: string;
  readonly VITE_APP_HOST: string;
  readonly VITE_PUBLIC_URL: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}