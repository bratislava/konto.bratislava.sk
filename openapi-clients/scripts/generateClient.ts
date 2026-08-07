import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import camelcase from 'camelcase'
import { Command } from 'commander'
import { rimrafSync } from 'rimraf'

/**
 * Step one of two: turn a spec into TypeScript under `generated/`. `pnpm run build` runs this
 * and then compiles the result with tsdown. Neither `generated/` nor `dist/` is committed.
 *
 * What keeps the dependency graph acyclic is that the *specs* are committed, not this output.
 * Backends import each other's clients, so if a client had to be derived from a live backend
 * the graph would be circular; deriving it from a committed spec breaks that.
 */

const clientTypes = [
  'forms',
  'tax',
  'city-account',
  'clamav-scanner',
  'slovensko-sk',
  'magproxy',
] as const
type ClientType = (typeof clientTypes)[number]

const packageRoot = join(import.meta.dirname, '..')
const generatedRoot = join(packageRoot, 'generated')

const specsDir = dirname(
  require.resolve('openapi-specs/package.json', { paths: [packageRoot] }),
)

/**
 * Where each client's spec comes from. The four in-repo backends write theirs into
 * `openapi-specs` with `openapi-cli`, so generation reads a committed file and needs no
 * network. The other two describe services outside this repo and are still fetched.
 */
const specSources: Record<ClientType, string> = {
  forms: join(specsDir, 'forms.json'),
  tax: join(specsDir, 'tax.json'),
  'city-account': join(specsDir, 'city-account.json'),
  'clamav-scanner': join(specsDir, 'clamav-scanner.json'),
  'slovensko-sk': 'https://fix.slovensko-sk-api.bratislava.sk/openapi.yaml',
  magproxy: 'https://new-magproxy.staging.bratislava.sk/api-json',
}

function runOpenApiGenerator(type: ClientType, outputDir: string): void {
  const input = specSources[type]
  if (!input.startsWith('http') && !existsSync(input)) {
    throw new Error(
      `${input} does not exist — run "pnpm --filter <backend> run openapi" first`,
    )
  }

  execFileSync(
    'pnpm',
    [
      'exec',
      'openapi-generator-cli',
      'generate',
      '-i',
      input,
      '-g',
      'typescript-axios',
      '-o',
      outputDir,
      '--skip-validate-spec',
    ],
    { stdio: 'inherit', cwd: packageRoot, shell: true },
  )
}

/** The generator writes a `docs/` tree we do not ship, plus a manifest listing it. */
function removeDocs(outputDir: string): void {
  rimrafSync(join(outputDir, 'docs'))

  const manifestPath = join(outputDir, '.openapi-generator', 'FILES')
  if (!existsSync(manifestPath)) return
  const kept = readFileSync(manifestPath, 'utf8')
    .split('\n')
    .filter((line) => !line.startsWith('docs/'))
    .join('\n')
  writeFileSync(manifestPath, kept)
}

/**
 * Synthesises a `client.ts` exposing one factory per tag as a single object, so consumers get
 * `createFormsClient({ basePath })` instead of wiring every generated `*Factory` by hand.
 */
function writeClientFile(type: ClientType, outputDir: string): void {
  const api = readFileSync(join(outputDir, 'api.ts'), 'utf8')
  const factories = [...api.matchAll(/export const (\w+Factory)/g)].map(
    (match) => match[1],
  )
  if (factories.length === 0) {
    throw new Error(`no API factories found in the generated code for ${type}`)
  }

  const name = camelcase(type, { pascalCase: true })
  writeFileSync(
    join(outputDir, 'client.ts'),
    `import {
  ${factories.join(',\n  ')}
} from './api'
import { Configuration, ConfigurationParameters } from './configuration'
import type { AxiosInstance } from 'axios'

type ClientConfig = {
  basePath: string
  configurationParameters?: ConfigurationParameters
  axios?: AxiosInstance
}

export interface ${name}Client extends
  ${factories.map((factory) => `ReturnType<typeof ${factory}>`).join(',\n  ')} {}

export const create${name}Client = ({
  basePath,
  configurationParameters = {},
  axios,
}: ClientConfig): ${name}Client => {
  const configuration = new Configuration(configurationParameters)
  const args = [configuration, basePath, axios] as const

  return {
    ${factories.map((factory) => `...${factory}(...args)`).join(',\n    ')}
  } satisfies ${name}Client
}
`,
  )
}

/**
 * Re-exports the two modules the generator leaves out of its index: our synthesised `client`,
 * and `base` (which holds `RequiredError`). Exporting `base` here is what lets `package.json`
 * use a single wildcard subpath instead of naming every entry point.
 */
function extendIndexFile(outputDir: string): void {
  const indexPath = join(outputDir, 'index.ts')
  const index = readFileSync(indexPath, 'utf8')
  writeFileSync(
    indexPath,
    `${index.trimEnd()}\nexport * from './client'\nexport * from './base'\n`,
  )
}

/**
 * The generator maps slovensko-sk's `Base64` and `Uuid` formats to bare type names it never
 * declares, so the output does not compile without these aliases.
 */
function addSlovenskoSkTypeAliases(outputDir: string): void {
  const apiPath = join(outputDir, 'api.ts')
  const api = readFileSync(apiPath, 'utf8')
  writeFileSync(apiPath, `type Base64 = string\ntype Uuid = string\n\n${api}`)
}

function generateClient(type: ClientType): void {
  const outputDir = join(generatedRoot, type)
  console.log(`\n=== ${type} <- ${specSources[type]}`)

  rimrafSync(outputDir)
  runOpenApiGenerator(type, outputDir)
  removeDocs(outputDir)
  writeClientFile(type, outputDir)
  extendIndexFile(outputDir)
  if (type === 'slovensko-sk') addSlovenskoSkTypeAliases(outputDir)

  console.log(`=== ${type} generated into generated/${type}`)
}

const program = new Command()
  .name('generateClient')
  .description('Generate a typed client from its OpenAPI spec into generated/.')
  .argument('<type>', `client to generate, or "all" (${clientTypes.join(', ')})`)
  .action((type: string) => {
    const targets =
      type === 'all'
        ? clientTypes
        : clientTypes.filter((candidate) => candidate === type)

    if (targets.length === 0) {
      console.error(
        `unknown client: ${type} — expected one of ${clientTypes.join(', ')}, or "all"`,
      )
      process.exitCode = 1
      return
    }

    for (const target of targets) generateClient(target)
  })

program.parse()
