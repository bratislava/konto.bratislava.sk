import 'dotenv/config'

import { defineConfig } from 'prisma/config'

export default defineConfig({
  // the main entry for your schema
  schema: 'prisma/schema.prisma',
  // where migrations should be generated
  migrations: {
    path: 'prisma/migrations',
  },
  // The database URL
  datasource: {
    // Use process.env directly with fallback for CI environments where DATABASE_URL may not be set
    // The fallback is only used to prevent config loading errors - actual DB connections will fail if DATABASE_URL is invalid
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/db?schema=public',
  },
})
