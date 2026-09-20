const ENV_KEY = 'E2E_RUN_ID'

/**
 * Namespaces every generated identity by run, so one run's leftovers on staging are recognisable and
 * two runs cannot hand out the same address.
 *
 * An environment variable is the transport because `globalSetup` runs in the main process while
 * workers are separate processes forked after it. The config file is not an option: it is
 * re-evaluated in every worker, so a value generated there would differ per worker.
 */
export const setRunId = (runId: string) => {
  process.env[ENV_KEY] = runId
}

/** Falls back to `local` when the suite runs without `globalSetup` e.g. a single test from an IDE. */
export const getRunId = () => process.env[ENV_KEY] ?? 'local'
