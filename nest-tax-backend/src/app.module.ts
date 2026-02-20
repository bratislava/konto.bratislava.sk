import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { CognitoAuthModule } from '@nestjs-cognito/auth'

import { AdminModule } from './admin/admin.module.js'
import { AppController } from './app.controller.js'
import { CardPaymentReportingModule } from './card-payment-reporting/card-payment-reporting.module.js'
import { PaymentModule } from './payment/payment.module.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { TasksModule } from './tasks/tasks.module.js'
import { TaxModule } from './tax/tax.module.js'
import AppLoggerMiddleware from './utils/middlewares/logger.js'
import { UtilsModule } from './utils-module/utils.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CognitoAuthModule.register({
      jwtVerifier: {
        userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
        clientId: process.env.COGNITO_CLIENT_ID,
        tokenUse: 'access',
      },
      identityProvider: {
        region: process.env.COGNITO_REGION,
      },
    }),
    PrismaModule,
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
