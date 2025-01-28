import path from 'node:path'

import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import PrismaModule from '../prisma/prisma.module'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import TaxService from './tax.service'

@Module({
  imports: [
    PrismaModule,
    // BEWARE: If Bull doesn't connect to Redis successfully, it will silently fail!
    // https://github.com/nestjs/bull/issues/1076
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: <string>configService.get('REDIS_SERVICE'),
          port: parseInt(<string>configService.get('REDIS_PORT') ?? '6379', 10),
          username: <string>configService.get('REDIS_USERNAME'),
          password: <string>configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync({
      name: 'tax',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        processors: [
          {
            name: 'generate_pdf',
            concurrency: parseInt(
              <string>configService.get('TAX_PDF_JOB_CONCURRENCY') ?? '10',
              10,
            ),
            // This registers processor as a separate process. As the PDF generation is CPU heavy and takes around ~3
            // seconds, without this, it would block the main thread.
            // eslint-disable-next-line unicorn/prefer-module
            path: path.join(__dirname, 'processor.js'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TaxService, ThrowerErrorGuard],
  exports: [TaxService],
})
export default class TaxModule {}
