import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'
import ApiJwtTokensModule from 'src/api-jwt-tokens/api-jwt-tokens.module'
import { MagproxyModule } from 'src/magproxy/magproxy.module'

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
    ApiJwtTokensModule,
  ],
  providers: [VerificationService, VerificationDataSubservice, VerificationSubservice],
  exports: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
