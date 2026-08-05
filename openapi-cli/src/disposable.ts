/** Something installed process-wide that must be undone, so the CLI stays re-entrant. */
export interface Disposable {
  dispose(): void
}
