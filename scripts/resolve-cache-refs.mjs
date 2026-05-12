import { appendFile } from 'node:fs/promises'

function normalizeToken(rawToken) {
  const token = rawToken.split('\n', 1)[0].trim()
  if (!token) {
    throw new Error('INPUT_TOKEN is empty')
  }
  return token
}

function parseSuffixes(rawSuffixes) {
  return rawSuffixes
    .split(/\r?\n/)
    .map((suffix) => suffix.trim())
    .filter(Boolean)
}

function buildCacheRefs(image, token, suffix) {
  const masterRef = `${image}:cache-master-${suffix}`
  const branchRef = `${image}:cache-${token}-${suffix}`

  if (token === 'master') {
    return {
      cache_from: `type=registry,ref=${masterRef}`,
      cache_to: `type=registry,ref=${masterRef},mode=max`,
    }
  }

  return {
    cache_from: `type=registry,ref=${masterRef}\ntype=registry,ref=${branchRef}`,
    cache_to: `type=registry,ref=${branchRef},mode=max`,
  }
}

async function main() {
  const image = process.env.INPUT_IMAGE ?? ''
  const rawSuffixes = process.env.INPUT_SUFFIXES ?? ''
  const rawToken = process.env.INPUT_TOKEN ?? ''
  const outputPath = process.env.GITHUB_OUTPUT

  if (!image) {
    throw new Error('INPUT_IMAGE is required')
  }

  if (!outputPath) {
    throw new Error('GITHUB_OUTPUT is not set')
  }

  const suffixes = parseSuffixes(rawSuffixes)
  if (suffixes.length === 0) {
    throw new Error('At least one suffix is required')
  }

  const token = normalizeToken(rawToken)
  const cacheRefs = Object.fromEntries(
    suffixes.map((suffix) => [suffix, buildCacheRefs(image, token, suffix)]),
  )

  await appendFile(outputPath, `cache_refs=${JSON.stringify(cacheRefs)}\n`)
}

await main()
