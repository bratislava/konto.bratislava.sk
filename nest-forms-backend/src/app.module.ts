import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { MinioModule } from 'nestjs-minio-client'

import AdminModule from './admin/admin.module'
import AppController from './app.controller'
import AppService from './app.service'
import AuthModule from './auth/auth.module'
import BaConfigModule from './config/ba-config.module'
import BaConfigService from './config/ba-config.service'
import ConvertModule from './convert/convert.module'
import ConvertPdfModule from './convert-pdf/convert-pdf.module'
import FilesModule from './files/files.module'
import FormValidatorRegistryModule from './form-validator-registry/form-validator-registry.module'
import FormsModule from './forms/forms.module'
import GinisModule from './ginis/ginis.module'
import NasesModule from './nases/nases.module'
import NasesConsumerModule from './nases-consumer/nases-consumer.module'
import PrismaModule from './prisma/prisma.module'
import RabbitmqClientModule from './rabbitmq-client/rabbitmq-client.module'
import SignerModule from './signer/signer.module'
import StatusModule from './status/status.module'
import TaxModule from './tax/tax.module'
import ThrowerErrorGuard from './utils/guards/thrower-error.guard'
import AppLoggerMiddleware from './utils/middlewares/logger.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BaConfigModule,
    MinioModule.registerAsync({
      isGlobal: true,
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => ({
        endPoint: baConfigService.minio.endpoint,
        port: baConfigService.minio.port,
        useSSL: baConfigService.minio.useSSL,
        accessKey: baConfigService.minio.accessKey,
        secretKey: baConfigService.minio.secretKey,
      }),
    }),
    BullModule.forRootAsync({
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: async (baConfigService: BaConfigService) => ({
        redis: {
          host: baConfigService.redis.service,
          port: baConfigService.redis.port,
          username: baConfigService.redis.username,
          password: baConfigService.redis.password,
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    FormsModule,
    FilesModule,
    NasesModule,
    StatusModule,
    RabbitmqClientModule,
    NasesConsumerModule,
    ConvertModule,
    ConvertPdfModule,
    GinisModule,
    TaxModule,
    FormValidatorRegistryModule,
    SignerModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, ThrowerErrorGuard],
})
export default class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
