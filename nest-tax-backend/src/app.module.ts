import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { CognitoAuthModule } from '@nestjs-cognito/auth'

import { AdminModule } from './admin/admin.module'
import { AppController } from './app.controller'
import { PaymentModule } from './payment/payment.module'
import { PrismaModule } from './prisma/prisma.module'
import { TasksModule } from './tasks/tasks.module'
import { TaxModule } from './tax/tax.module'
import { AppLoggerMiddleware } from './utils/middlewares/logger'

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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*')
  }
}
