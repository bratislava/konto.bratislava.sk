import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'

import { MagproxyModule } from 'src/magproxy/magproxy.module'
import { NasesModule } from '../nases/nases.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import ThrowerErrorGuard, { ErrorMessengerGuard } from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { MailgunSubservice } from '../utils/subservices/mailgun.subservice'
import { TurnstileSubservice } from '../utils/subservices/turnstile.subservice'
import { RABBIT_MQ } from './constants'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'
import { VerificationSubservice } from './utils/subservice/verification.subservice'
import { VerificationController } from './verification.controller'
import { VerificationService } from './verification.service'
import { BloomreachModule } from '../bloomreach/bloomreach.module'
import NasesUtilsService from 'src/utils/token.nases.service'

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
  ],
  providers: [
    VerificationService,
    DatabaseSubserviceUser,
    CognitoSubservice,
    TurnstileSubservice,
    VerificationSubservice,
    MailgunSubservice,
    ThrowerErrorGuard,
    ErrorMessengerGuard,
    NasesUtilsService,
  ],
  exports: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
