// Database configuration for production backend
export const databaseConfig = {
  development: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "smart_health_dev",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  },
  production: {
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  },
}

export const getDbConfig = () => {
  const env = process.env.NODE_ENV || "development"
  return databaseConfig[env as keyof typeof databaseConfig]
}
