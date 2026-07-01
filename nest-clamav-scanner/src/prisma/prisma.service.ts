import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client'
import type * as Prisma from '../generated/prisma/internal/prismaNamespace'

const prismaClientOptions = {
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
} satisfies Prisma.PrismaClientOptions

@Injectable()
export class PrismaService
  extends PrismaClient<typeof prismaClientOptions>
  implements OnModuleInit
{
  private readonly logger: Logger

  constructor() {
    super(prismaClientOptions)

    this.logger = new Logger(PrismaService.name)
  }

  async onModuleInit() {
    await this.$connect()
  }

  //async function which checks if prisma database is running
  public async isRunning(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      this.logger.error(error)
      return false
    }
  }

  enableShutdownHooks(app: INestApplication) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on('beforeExit', async () => {
      await app.close()
      // TODO check if this exists properly
    })
  }
}
