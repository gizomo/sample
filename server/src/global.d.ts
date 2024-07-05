declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      LOG_LEVEL: string;

      URL: string;
      PORT: string;
      API_PATH: string;

      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;

      PWD_SALT_ROUNDS: string;

      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASSWORD: string;

      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
    }
  }
}
export {};
