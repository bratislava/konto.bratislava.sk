import { Prisma } from '../../generated/prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

/**
 * Serializes concurrent read-decide-write sequences against the same outbox
 * dedup key via a transaction-scoped Postgres advisory lock.
 * Released automatically on commit/rollback, so it never needs an explicit
 * unlocking.
 */
export async function lockOutboxDedupKey(
  tx: Prisma.TransactionClient,
  ...keyParts: string[]
): Promise<void> {
  const key = keyParts.join(':')
  //language=postgresql
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
}

/**
 * Runs `fn` only if no other call with the same `key` is currently running,
 * anywhere - a session-level Postgres advisory lock held for the whole
 * duration of `fn` (not just one transaction) and shared across app
 * instances, unlike an in-memory flag. Never blocks: if the lock is already
 * held elsewhere, returns immediately without running `fn`.
 */
export async function runSingleFlight(
  prisma: PrismaService,
  key: string,
  fn: () => Promise<void>
): Promise<void> {
  //language=postgresql
  const [{ acquired }] = await prisma.$queryRaw<
    { acquired: boolean }[]
  >`SELECT pg_try_advisory_lock(hashtext(${key})) AS acquired`

  if (!acquired) {
    return
  }

  try {
    await fn()
  } finally {
    //language=postgresql
    await prisma.$queryRaw`SELECT pg_advisory_unlock(hashtext(${key}))`
  }
}
