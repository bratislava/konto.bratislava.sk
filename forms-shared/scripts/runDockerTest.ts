import { execSync } from 'child_process'
import * as path from 'path'
import { get as getAppRootDir } from 'app-root-dir'
import { SharedLogger } from '../src/utils/sharedLogger'

const logger = new SharedLogger('runDockerTest.ts')

const cleanupImage = (imageName: string) => {
  try {
    const rmiCommand = `docker rmi ${imageName}`
    logger.log(`Attempting to remove Docker image: ${rmiCommand}`)
    execSync(rmiCommand, { stdio: 'inherit' })
    logger.log(`Docker image ${imageName} removed successfully.`)
  } catch (cleanupError) {
    logger.error(
      `Failed to remove Docker image ${imageName}. It might be in use, already removed, or an error occurred. Error: ${cleanupError}`,
    )
  }
}

async function main() {
  const args = process.argv.slice(2)
  const target = args[0]

  if (target !== 'test' && target !== 'test-update') {
    logger.error(
      'Error: Missing or invalid target. Usage: ts-node scripts/runDockerTest.ts <test|test-update>',
    )
    process.exit(1)
  }

  const projectRoot = getAppRootDir()
  const imageName = `forms-shared-docker-runner:${target}`
  const dockerfileName = 'Dockerfile'

  logger.log(`Starting Docker process for target: ${target}`)

  try {
    const buildCommand = `docker build -t ${imageName} --target ${target} -f "${path.join(projectRoot, dockerfileName)}" "${projectRoot}"`
    logger.log(`Executing build: ${buildCommand}`)
    execSync(buildCommand, { stdio: 'inherit', cwd: projectRoot })
    logger.log(`Docker image ${imageName} built successfully.`)

    let runCommand = 'docker run --rm'

    if (target === 'test-update') {
      logger.log('Configuring volume mounts for snapshot updates...')
      runCommand += ` -v "${projectRoot}:/app" -v /app/node_modules`
    }

    runCommand += ` ${imageName}`

    logger.log(`Executing run: ${runCommand}`)
    execSync(runCommand, { stdio: 'inherit', cwd: projectRoot })

    logger.log(`Docker target '${target}' completed successfully.`)
  } catch (error) {
    logger.error(`Error during Docker operation for target '${target}'.`)
    logger.error(error)
    process.exit(1)
  } finally {
    logger.log('Operation finished. Running final cleanup...')
    cleanupImage(imageName)
  }
}

main().catch((error) => {
  logger.error('Unhandled error in main function:', error)
  process.exit(1)
})
