import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

import { escapeForLogfmt } from '../utils/logging'
import alertError, {
  LineLoggerSubservice,
} from '../utils/subservices/line-logger.subservice'

@Injectable()
export default class PrismaService
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
  public async isRunning(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      alertError('Prisma is not running.', this.logger, error)
      return false
    }
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('beforeExit', async () => {
      await app.close()
    })
  }
}
