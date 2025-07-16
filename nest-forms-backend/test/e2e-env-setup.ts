// eslint-disable-next-line unicorn/import-style
import { resolve } from 'node:path'

import { config } from 'dotenv'

// eslint-disable-next-line unicorn/prefer-module
const envPath = resolve(__dirname, '..', '.env.spec')
config({ path: envPath })
