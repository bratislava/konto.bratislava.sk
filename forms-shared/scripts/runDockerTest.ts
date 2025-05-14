import { execSync } from 'child_process'
import * as path from 'path'
import { get as getAppRootDir } from 'app-root-dir'

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
  const target = args[0]

  if (target !== 'test' && target !== 'test-update') {
    console.error(
      'Error: Missing or invalid target. Usage: ts-node scripts/runDockerTest.ts <test|test-update>',
    )
    process.exit(1)
  }

  const projectRoot = getAppRootDir()
  const imageName = `forms-shared-docker-runner:${target}`
  const dockerfileName = 'Dockerfile'

  console.log(`Starting Docker process for target: ${target}`)

  try {
    const buildCommand = `docker build -t ${imageName} --target ${target} -f "${path.join(projectRoot, dockerfileName)}" "${projectRoot}"`
    console.log(`Executing build: ${buildCommand}`)
    execSync(buildCommand, { stdio: 'inherit', cwd: projectRoot })
    console.log(`Docker image ${imageName} built successfully.`)

    let runCommand = 'docker run --rm'

    if (target === 'test-update') {
      console.log('Configuring volume mounts for snapshot updates...')
      runCommand += ` -v "${projectRoot}:/app" -v /app/node_modules`
    }

    runCommand += ` ${imageName}`

    console.log(`Executing run: ${runCommand}`)
    execSync(runCommand, { stdio: 'inherit', cwd: projectRoot })

    console.log(`Docker target '${target}' completed successfully.`)
  } catch (error) {
    console.error(`Error during Docker operation for target '${target}'.`)
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
