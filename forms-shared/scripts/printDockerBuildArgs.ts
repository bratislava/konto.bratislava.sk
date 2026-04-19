import { prepareDockerBuildArgs } from './prepareDockerBuildArgs.ts'

prepareDockerBuildArgs(process.argv[2])
  .then((buildArgs) => {
    Object.entries(buildArgs).forEach(([key, value]) => {
      console.log(`${key}=${value}`)
    })
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
