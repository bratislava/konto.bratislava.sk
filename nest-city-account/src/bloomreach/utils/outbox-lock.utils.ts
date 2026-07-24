import { Prisma } from '../../generated/prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

export async function lockOutboxDedupKey(
  tx: Prisma.TransactionClient,
  ...keyParts: string[]
): Promise<void> {
  const key = keyParts.join(':')
  //language=postgresql
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`
}

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
