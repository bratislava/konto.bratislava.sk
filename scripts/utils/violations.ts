/**
 * Shared exit contract for the verification scripts: either log a summary and
 * succeed, or print every violation and fail the process. `formatViolation` may
 * return a multi-line string.
 */
export function reportViolations<Violation>({
  violations,
  successMessage,
  failureHeading,
  formatViolation,
}: {
  violations: Violation[]
  successMessage: string
  failureHeading: string
  formatViolation: (violation: Violation) => string
}): void {
  if (violations.length === 0) {
    console.log(successMessage)
    return
  }

  console.error(`${failureHeading}\n`)

  for (const violation of violations) {
    console.error(formatViolation(violation))
  }

  process.exitCode = 1
}
