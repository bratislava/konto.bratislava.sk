import { execSync } from 'node:child_process'
import path from 'node:path'

/**
 * Runs the tests in the same Docker image as CI, so screenshots match pixel for pixel.
 *
 * Build args and image tags come from the bake files in the repository root. `--load` is needed
 * because the image is started with `docker run` afterwards; bake leaves the result in the build
 * cache otherwise. The update target mounts the snapshot directory, so new and changed snapshots
 * land in the working tree.
 */

const bakeTargets = {
  'test-local': {
    target: 'email-templates-test-local',
    image: 'email-templates-docker-runner:test-local',
  },
  'test-local-update': {
    target: 'email-templates-test-local-update',
    image: 'email-templates-docker-runner:test-local-update',
  },
} as const

type BakeTargetName = keyof typeof bakeTargets

const isBakeTargetName = (value: string | undefined): value is BakeTargetName =>
  value !== undefined && value in bakeTargets

const targetName = process.argv[2]
if (!isBakeTargetName(targetName)) {
  console.error(
    `Missing or invalid target. Usage: node scripts/run-docker-test.ts <${Object.keys(bakeTargets).join('|')}>`,
  )
  process.exit(1)
}

const { target, image } = bakeTargets[targetName]
const packageRoot = path.join(import.meta.dirname, '..')
const workspaceRoot = path.join(packageRoot, '..')

try {
  execSync(`docker buildx bake --load ${target}`, { stdio: 'inherit', cwd: workspaceRoot })

  const snapshotsMount =
    targetName === 'test-local-update'
      ? ` -v "${path.join(packageRoot, 'tests', '__snapshots__')}:/app/email-templates/tests/__snapshots__"`
      : ''
  execSync(`docker run --rm${snapshotsMount} ${image}`, { stdio: 'inherit', cwd: workspaceRoot })
} catch {
  console.error(`Docker target '${targetName}' failed.`)
  process.exitCode = 1
} finally {
  try {
    execSync(`docker rmi ${image}`, { stdio: 'inherit' })
  } catch {
    console.error(`Could not remove the image ${image}; it may be in use or already removed.`)
  }
}
