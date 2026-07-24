import { Prisma } from '../../generated/prisma/client'

const TERMINAL_OVERRIDE_SQLSTATE = 'BR001'
const DEDUP_CONFLICT_SQLSTATE = 'BR002'

export function isTerminalOverrideError(error: unknown): boolean {
  const cause = (error as { cause?: { kind?: string; code?: string } } | undefined)?.cause
  return (
    error instanceof Error &&
    error.name === 'DriverAdapterError' &&
    cause?.kind === 'postgres' &&
    cause.code === TERMINAL_OVERRIDE_SQLSTATE
  )
}

export function isBloomreachOutboxDedupConflictError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === DEDUP_CONFLICT_SQLSTATE &&
    error.meta?.modelName === 'BloomreachOutbox'
  )
}
