import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { MinioModule } from 'nestjs-minio-client'

import AdminModule from './admin/admin.module'
import AppController from './app.controller'
import AppService from './app.service'
import AuthModule from './auth/auth.module'
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
import StatusModule from './status/status.module'
import TaxModule from './tax/tax.module'
import ThrowerErrorGuard from './utils/guards/thrower-error.guard'
import AppLoggerMiddleware from './utils/middlewares/logger.service'
import SharepointSubservice from './utils/subservices/sharepoint.subservice'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MinioModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        endPoint: <string>configService.get('MINIO_ENDPOINT') ?? '',
        port: parseInt(<string>configService.get('MINIO_PORT') ?? '', 10),
        useSSL: configService.get('MINIO_USE_SSL') === 'true',
        accessKey: <string>configService.get('MINIO_ACCESS_KEY') ?? '',
        secretKey: <string>configService.get('MINIO_SECRET_KEY') ?? '',
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
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, SharepointSubservice, ThrowerErrorGuard],
})
export default class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
