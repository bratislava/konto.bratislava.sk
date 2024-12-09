import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { escapeForLogfmt } from '../utils/logging'

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'info' | 'warn' | 'error'>
  implements OnModuleInit
{
  private readonly logger: LineLoggerSubservice

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
      errorFormat: 'colorless',
    })
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
