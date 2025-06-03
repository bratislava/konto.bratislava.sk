import * as crypto from 'node:crypto'
import * as https from 'node:https'
import * as tls from 'node:tls'

import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { MinioModule } from 'nestjs-minio-client'

import AdminModule from './admin/admin.module'
import AppController from './app.controller'
import AppService from './app.service'
import AuthModule from './auth/auth.module'
import { AuthV2Module } from './auth-v2/auth-v2.module'
import BaConfigModule from './config/ba-config.module'
import BaConfigService from './config/ba-config.service'
import ConvertModule from './convert/convert.module'
import ConvertPdfModule from './convert-pdf/convert-pdf.module'
import FilesModule from './files/files.module'
import FormValidatorRegistryModule from './form-validator-registry/form-validator-registry.module'
import FormsModule from './forms/forms.module'
import { FormsV2Module } from './forms-v2/forms-v2.module'
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
import SharepointSubservice from './utils/subservices/sharepoint.subservice'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BaConfigModule,
    MinioModule.registerAsync({
      isGlobal: true,
      imports: [BaConfigModule],
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => {
        const httpsAgent = new https.Agent({
          checkServerIdentity: (
            hostname: string,
            cert: tls.PeerCertificate,
          ) => {
            const certFingerprint = crypto
              .createHash('sha256')
              .update(cert.raw)
              .digest('hex')
              .toLowerCase()

            const allowedInvalidCert =
              'eb7a46361947152582f618e85a28c79ba7e1fdfdb9b2ca272d5a8a7d9d8636ae'

            if (certFingerprint === allowedInvalidCert.toLowerCase()) {
              return // undefined means accept the certificate
            }

            // For all other certificates, use default Node.js validation
            // This will accept all valid certificates from trusted CAs
            // eslint-disable-next-line consistent-return
            return tls.checkServerIdentity(hostname, cert)
          },
        })

        return {
          endPoint: baConfigService.minio.endpoint,
          port: baConfigService.minio.port,
          useSSL: baConfigService.minio.useSSL,
          accessKey: baConfigService.minio.accessKey,
          secretKey: baConfigService.minio.secretKey,
          transportAgent: httpsAgent,
        }
      },
    }),
    PrismaModule,
    AuthModule,
    AuthV2Module,
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
    FormsV2Module,
    // BEWARE: If Bull doesn't connect to Redis successfully, it will silently fail!
    // https://github.com/nestjs/bull/issues/1076
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
