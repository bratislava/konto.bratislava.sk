import { MiddlewareConsumer, Module } from '@nestjs/common'
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
import AppLoggerMiddleware from './utils/middlewares/logger'
import { SharedModule } from './utils/subservices/shared.module'
import { UtilsModule } from './utils-module/utils.module'

@Module({
  imports: [
    BaConfigModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
