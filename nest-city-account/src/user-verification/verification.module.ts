import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'

import { MagproxyModule } from 'src/magproxy/magproxy.module'
import { NasesModule } from '../nases/nases.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { TurnstileSubservice } from '../utils/subservices/turnstile.subservice'
import { RABBIT_MQ } from './constants'
import { VerificationDataSubservice } from './utils/subservice/verification-data.subservice'
import { VerificationSubservice } from './utils/subservice/verification.subservice'
import { VerificationController } from './verification.controller'
import { VerificationService } from './verification.service'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { MailgunModule } from '../mailgun/mailgun.module'
import TokenSubservice from 'src/user-verification/utils/subservice/token.subservice'

@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: process.env.RABBIT_MQ_URI ?? '',
      exchanges: [
        {
          name: RABBIT_MQ.EXCHANGE,
          type: 'x-delayed-message',
          options: {
            arguments: { 'x-delayed-type': 'direct' },
          },
        },
      ],
      connectionInitOptions: { wait: false },
      logger: new LineLoggerSubservice('RabbitMQ'),
    }),
    NasesModule,
    MagproxyModule,
    PhysicalEntityModule,
    BloomreachModule,
    MailgunModule,
  ],
  providers: [
    VerificationService,
    VerificationDataSubservice,
    CognitoSubservice,
    TurnstileSubservice,
    VerificationSubservice,
    ThrowerErrorGuard,
    TokenSubservice,
  ],
  exports: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
