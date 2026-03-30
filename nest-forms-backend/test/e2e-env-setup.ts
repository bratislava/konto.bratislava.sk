import { resolve } from 'node:path'

import { config } from 'dotenv'

const envPath = resolve(__dirname, '..', '.env.spec')
config({ path: envPath })
