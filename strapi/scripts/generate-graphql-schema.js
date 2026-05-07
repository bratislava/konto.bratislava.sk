const { compileStrapi, createStrapi } = require('@strapi/core')
const { PostgreSqlContainer } = require('@testcontainers/postgresql')
const { get: getAppRootDir } = require('app-root-dir')
const crypto = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const { dir: createTempDir } = require('tmp-promise')

function randomBase64(size) {
  return Buffer.from(crypto.randomBytes(size)).toString('base64')
}

async function generateSchemaContent() {
  const tempSchemaDir = await createTempDir()
  const tempSchemaPath = path.join(tempSchemaDir.path, 'schema.graphql')
  const container = await new PostgreSqlContainer('postgres:alpine').start()

  let app

  try {
    process.env.GRAPHQL_SCHEMA_ARTIFACT_PATH = tempSchemaPath
    process.env.DATABASE_HOST = container.getHost()
    process.env.DATABASE_PORT = String(container.getPort())
    process.env.DATABASE_NAME = container.getDatabase()
    process.env.DATABASE_USERNAME = container.getUsername()
    process.env.POSTGRES_PASSWORD = container.getPassword()
    process.env.DATABASE_SCHEMA = 'public'
    process.env.APP_KEYS = [
      randomBase64(16),
      randomBase64(16),
      randomBase64(16),
      randomBase64(16),
    ].join(',')
    process.env.ADMIN_JWT_SECRET = randomBase64(32)
    process.env.API_TOKEN_SALT = randomBase64(16)
    process.env.JWT_SECRET = randomBase64(32)

    console.log('Starting Strapi to generate GraphQL schema')
    const appContext = await compileStrapi()
    app = await createStrapi(appContext).load()

    return await fs.readFile(tempSchemaPath, 'utf8')
  } finally {
    if (app) {
      await app.destroy()
    }

    await container.stop()
    await tempSchemaDir.cleanup().catch(() => {})
  }
}

/**
 * Generates Strapi GraphQL schema programmatically without running the app.
 */
async function main() {
  const appRootDir = getAppRootDir()
  const schemaPath = path.join(appRootDir, 'schema.graphql')
  const schemaContent = await generateSchemaContent()
  await fs.writeFile(schemaPath, schemaContent, 'utf8')

  console.log(`Generated ${schemaPath}`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
