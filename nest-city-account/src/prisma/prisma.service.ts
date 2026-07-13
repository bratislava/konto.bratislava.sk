import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'
import type * as Prisma from '../generated/prisma/internal/prismaNamespace'
import { escapeForLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

export const ACTIVE_USER_FILTER = { isDeceased: false }

const prismaClientOptions = {
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
  errorFormat: 'colorless',
} satisfies Prisma.PrismaClientOptions

@Injectable()
export class PrismaService
  extends PrismaClient<typeof prismaClientOptions>
  implements OnModuleInit
{
  private readonly logger: LineLoggerSubservice

  constructor() {
    super(prismaClientOptions)

    this.logger = new LineLoggerSubservice(PrismaService.name)
    this.$on('info', (e) => {
      this.logger.log(
        `target="${escapeForLogfmt(e.target)}" message="${escapeForLogfmt(e.message)}"`
      )
    })
    this.$on('warn', (e) => {
      this.logger.warn(
        `target="${escapeForLogfmt(e.target)}" message="${escapeForLogfmt(e.message)}"`
      )
    })

    // We can catch the exceptions thrown, no need to log here.
    // this.$on('error', (e) => {
    //   this.logger.error(
    //     `target="${escapeForLogfmt(e.target)}" message="${escapeForLogfmt(e.message)}"`
    //   )
    // })
  }

  async onModuleInit() {
    await this.$connect()
  }

  // 'beforeExit' hook deprecated. User `app.enableShutdownHooks()` in main.ts instead if required
}
