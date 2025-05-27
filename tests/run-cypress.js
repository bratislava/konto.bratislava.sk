const { spawn } = require('child_process')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const main = async () => {
  const argv = yargs(hideBin(process.argv))
    .usage(
      'Usage: $0 <mode> --browser=<browser> --device=<device> --visualTesting=<visualTesting> [--baseUrl=<baseUrl>]',
    )
    .positional('mode', {
      describe: 'Operation mode',
      choices: ['open', 'run'], // Only allow "open" or "run" as valid modes
      demandOption: true,
    })
    .option('browser', {
      describe: 'Choose the browser',
      choices: ['chrome', 'edge', 'electron', 'firefox'],
      demandOption: true,
    })
    .option('device', {
      describe: 'Specify the device type',
      choices: ['all', 'desktop', 'mobile'],
      demandOption: true,
    })
    .option('visualTesting', {
      describe: 'Set visual testing mode',
      choices: ['ci', 'local'],
      demandOption: true,
    })
    .option('baseUrl', {
      describe: 'Set the base URL',
      default: 'http://localhost:3000',
    })
    .help().argv

  const { _, browser, device, visualTesting, baseUrl } = argv
  const mode = _[0]

  if (!['open', 'run'].includes(mode)) {
    console.error('Error: Mode must be "open" or "run".')
    process.exit(1)
  }

  // Constructing the Cypress command
  const args = [
    mode,
    '--e2e',
    '--browser',
    browser,
    '--env',
    `DEVICE=${device},pluginVisualRegressionImagesPath=cypress/visualTesting/${visualTesting}/,BASEURL=${baseUrl}`,
  ]
  const cypressProcess = spawn('npx', ['cypress', ...args], { stdio: 'inherit' })

  cypressProcess.on('close', (code) => {
    process.exit(code) // Exit with the code from the Cypress process
  })
}

main().catch((error) => {
  console.error(`Unhandled error: ${error.message}`)
  process.exit(1)
})
