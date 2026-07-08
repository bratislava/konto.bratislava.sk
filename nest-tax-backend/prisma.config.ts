import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// https://github.com/prisma/prisma/issues/28590
const skipDatasourceUrlEnv =
  process.env.PRISMA_SKIP_DATASOURCE_URL === '1' ||
  process.env.PRISMA_SKIP_DATASOURCE_URL === 'true'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: skipDatasourceUrlEnv ? '' : env('DATABASE_URL'),
  },
})
