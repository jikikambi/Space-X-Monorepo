/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPACEX_API: string; 
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}