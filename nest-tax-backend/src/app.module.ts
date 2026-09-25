import {
  AppLoggerMiddleware,
  birthNumberRedactor,
  emailRedactor,
  LogSanitizationModule,
  NestLoggingModule,
} from '@bratislava/log-nest'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { CognitoAuthModule } from '@nestjs-cognito/auth'

import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { CardPaymentReportingModule } from './card-payment-reporting/card-payment-reporting.module'
import BaConfigModule from './config/ba-config.module'
import BaConfigService from './config/ba-config.service'
import { PaymentModule } from './payment/payment.module'
import { PrismaModule } from './prisma/prisma.module'
import { TasksModule } from './tasks/tasks.module'
import { TaxModule } from './tax/tax.module'
import alertReporting from './utils/constants/error.alerts'
import { SharedModule } from './utils/subservices/shared.module'
import { UtilsModule } from './utils-module/utils.module'

@Module({
  imports: [
    BaConfigModule,
    NestLoggingModule.forRoot({ alertReporting }),
    LogSanitizationModule.forRoot({
      redactors: [emailRedactor, birthNumberRedactor],
      // Error response envelope fields, so failed requests stay debuggable
      allowShape: {
        message: true,
        error: true,
        statusCode: true,
        status: true,
        errorName: true,
      },
      onDisallowed: 'redact',
    }),
    CognitoAuthModule.registerAsync({
      inject: [BaConfigService],
      useFactory: (baConfigService: BaConfigService) => ({
        jwtVerifier: {
          userPoolId: baConfigService.cognito.userPoolId,
          clientId: baConfigService.cognito.clientId,
          tokenUse: 'access',
        },
        identityProvider: {
          region: baConfigService.cognito.region,
        },
      }),
    }),
    PrismaModule,
    SharedModule,
    TaxModule,
    PaymentModule,
    AdminModule,
    TasksModule,
    ScheduleModule.forRoot(),
    CardPaymentReportingModule,
    UtilsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
