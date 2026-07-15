/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SLACK_API_ENDPOINT?: string;
  readonly VITE_COST_API_ENDPOINT?: string;
  readonly VITE_REAL_ACCOUNT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
