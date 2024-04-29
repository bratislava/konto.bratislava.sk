import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

import alertError from '../utils/logging'

@Injectable()
export default class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  private logger: Logger = new Logger('PrismaService')

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  // async function which checks if prisma database is running
  public async isRunning(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      alertError('Prisma is not running.', this.logger, <string>error)
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
