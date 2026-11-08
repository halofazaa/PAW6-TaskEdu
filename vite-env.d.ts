/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION?: string;
  readonly VITE_COLLEGE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
