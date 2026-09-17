import { execSync } from 'child_process'
import * as path from 'path'
import { get as getAppRootDir } from 'app-root-dir'

/**
 * Build args and image tags come from the bake files in the repository root, so
 * there is nothing to pass in here. `--load` is needed because the image is
 * started with `docker run` afterwards; bake leaves the result in the build
 * cache otherwise.
 */
const bakeTargets = {
  'test-local': {
    target: 'forms-shared-test-local',
    image: 'forms-shared-docker-runner:test-local',
  },
  'test-local-update': {
    target: 'forms-shared-test-local-update',
    image: 'forms-shared-docker-runner:test-local-update',
  },
} as const

type BakeTargetName = keyof typeof bakeTargets

const isBakeTargetName = (value: string | undefined): value is BakeTargetName =>
  value !== undefined && value in bakeTargets

const cleanupImage = (imageName: string) => {
  try {
    const rmiCommand = `docker rmi ${imageName}`
    console.log(`Attempting to remove Docker image: ${rmiCommand}`)
    execSync(rmiCommand, { stdio: 'inherit' })
    console.log(`Docker image ${imageName} removed successfully.`)
  } catch (cleanupError) {
    console.error(
      `Failed to remove Docker image ${imageName}. It might be in use, already removed, or an error occurred. Error: ${cleanupError}`,
    )
  }
}

async function main() {
  const args = process.argv.slice(2)
  const targetName = args[0]

  if (!isBakeTargetName(targetName)) {
    console.error(
      `Error: Missing or invalid target. Usage: ts-node scripts/runDockerTest.ts <${Object.keys(bakeTargets).join('|')}>`,
    )
    process.exit(1)
  }

  const { target, image: imageName } = bakeTargets[targetName]

  const appRoot = getAppRootDir()
  const projectRoot =
    path.basename(appRoot) === 'forms-shared' ? appRoot : path.join(appRoot, 'forms-shared')
  const workspaceRoot = path.resolve(projectRoot, '..')

  console.log(`Starting Docker process for target: ${targetName}`)

  try {
    const buildCommand = `docker buildx bake --load ${target}`
    console.log(`Executing build: ${buildCommand}`)
    execSync(buildCommand, { stdio: 'inherit', cwd: workspaceRoot })
    console.log(`Docker image ${imageName} built successfully.`)

    let runCommand = 'docker run --rm'

    if (targetName === 'test-local-update') {
      console.log('Configuring volume mounts for snapshot updates...')
      runCommand += ` -v "${projectRoot}:/app/forms-shared" -v /app/forms-shared/node_modules -v /app/node_modules`
    }

    runCommand += ` ${imageName}`

    console.log(`Executing run: ${runCommand}`)
    execSync(runCommand, { stdio: 'inherit', cwd: workspaceRoot })

    console.log(`Docker target '${targetName}' completed successfully.`)
  } catch (error) {
    console.error(`Error during Docker operation for target '${targetName}'.`)
    console.error(error)
    process.exit(1)
  } finally {
    console.log('Operation finished. Running final cleanup...')
    cleanupImage(imageName)
  }
}

main().catch((error) => {
  console.error('Unhandled error in main function:', error)
  process.exit(1)
})
