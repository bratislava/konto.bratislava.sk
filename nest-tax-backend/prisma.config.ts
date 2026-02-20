import 'dotenv/config'

import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // the main entry for your schema
  schema: 'prisma/schema.prisma',
  // where migrations should be generated
  migrations: {
    path: 'prisma/migrations',
  },
  // The database URL
  datasource: {
    // Type Safe env() helper
    // Does not replace the need for dotenv
    url: env('DATABASE_URL'),
  },
})
