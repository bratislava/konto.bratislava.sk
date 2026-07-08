import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'

import BaConfigService from '../config/ba-config.service'
import { PrismaClient } from '../generated/prisma/client'
import type * as Prisma from '../generated/prisma/internal/prismaNamespace'
import { escapeForLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

const getPrismaClientOptions = (connectionString: string) => {
  return {
    adapter: new PrismaPg({
      connectionString,
    }),
    log: [
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
    errorFormat: 'colorless',
  } satisfies Prisma.PrismaClientOptions
}

@Injectable()
export default class PrismaService
  extends PrismaClient<ReturnType<typeof getPrismaClientOptions>>
  implements OnModuleInit
{
  private readonly logger: LineLoggerSubservice

  constructor(private readonly baConfigService: BaConfigService) {
    super(getPrismaClientOptions(baConfigService.database.url))

    this.logger = new LineLoggerSubservice(PrismaService.name)

    this.$on('info', (e) => {
      this.logger.log(
        `target="${escapeForLogfmt(e.target)}" message="${escapeForLogfmt(e.message)}"`,
      )
    })

    this.$on('warn', (e) => {
      this.logger.warn(
        `target="${escapeForLogfmt(e.target)}" message="${escapeForLogfmt(e.message)}"`,
      )
    })

    // We can catch the exceptions thrown, no need to log here.
    // this.$on('error', (e) => {
    //   this.logger.error(
    //     `target="${escapeForLogfmt(e.target)}" message="${escapeForLogfmt(e.message)}"`
    //   )
    // })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  // async function which checks if prisma database is running
  public async isRunning() {
    await this.$queryRaw`SELECT 1`
  }

  enableShutdownHooks(app: INestApplication): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('beforeExit', async () => {
      await app.close()
    })
  }
}
