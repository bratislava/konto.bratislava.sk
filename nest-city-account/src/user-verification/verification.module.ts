import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'

import { MagproxyModule } from 'src/magproxy/magproxy.module'
import { NasesModule } from '../nases/nases.module'
import ThrowerErrorGuard, { ErrorMessengerGuard } from '../utils/guards/errors.guard'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { MailgunSubservice } from '../utils/subservices/mailgun.subservice'
import { TurnstileSubservice } from '../utils/subservices/turnstile.subservice'
import { RABBIT_MQ } from './constats'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'
import { TasksSubservice } from './utils/subservice/tasks.subservice'
import { VerificationSubservice } from './utils/subservice/verification.subservice'
import { VerificationController } from './verification.controller'
import { VerificationService } from './verification.service'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri:
        process.env.NODE_ENV === 'production'
          ? `amqp://${process.env.RABBIT_MQ_USERNAME}:${process.env.RABBIT_MQ_PASSWORD}@${process.env.RABBIT_MQ_HOST}:${process.env.RABBIT_MQ_PORT}`
          : process.env.RABBIT_MQ_URI ?? '',
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
    TasksSubservice,
  ],
  exports: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
