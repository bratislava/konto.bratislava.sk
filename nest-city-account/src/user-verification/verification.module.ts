import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'
import { MagproxyModule } from 'src/magproxy/magproxy.module'
import TokenSubservice from 'src/user-verification/utils/subservice/token.subservice'

import { BloomreachModule } from '../bloomreach/bloomreach.module'
import { MailgunModule } from '../mailgun/mailgun.module'
import { NasesModule } from '../nases/nases.module'
import { PhysicalEntityModule } from '../physical-entity/physical-entity.module'
import { UserModule } from '../user/user.module'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { RABBIT_MQ } from './constants'
import { VerificationSubservice } from './utils/subservice/verification.subservice'
import { VerificationDataSubservice } from './utils/subservice/verification-data.subservice'
import { VerificationController } from './verification.controller'
import { VerificationService } from './verification.service'

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
    UserModule,
  ],
  providers: [
    VerificationService,
    VerificationDataSubservice,
    VerificationSubservice,
    TokenSubservice,
  ],
  exports: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
