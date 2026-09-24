import { LineLoggerSubservice } from '@bratislava/log-nest'
import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'

import BaConfigModule from '../config/ba-config.module'
import BaConfigService from '../config/ba-config.service'
import { RABBIT_FORM_DELIVERY } from '../utils/constants'
import RabbitmqClientService from './rabbitmq-client.service'

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [BaConfigModule],
      useFactory: (baConfigService: BaConfigService) => ({
        uri: baConfigService.rabbitMq.uri,
        exchanges: [
          {
            name: RABBIT_FORM_DELIVERY.EXCHANGE,
            type: 'x-delayed-message',
            options: {
              arguments: { 'x-delayed-type': 'direct' },
            },
          },
        ],
        connectionInitOptions: { wait: false },
        logger: new LineLoggerSubservice('RabbitMQ'),
      }),
      inject: [BaConfigService],
    }),
  ],
  providers: [RabbitmqClientService],
  exports: [RabbitmqClientService, RabbitMQModule],
})
export default class RabbitmqClientModule {
  constructor(
    private rabbitmqClientService: RabbitmqClientService,
    private amqpConnection: AmqpConnection,
    private baConfigService: BaConfigService,
    private readonly logger: LineLoggerSubservice,
  ) {
    this.rabbitmqClientService = new RabbitmqClientService(
      amqpConnection,
      new LineLoggerSubservice(RabbitmqClientService.name),
    )
    this.logger.log(
      `Setting up rabbit mq connection to: ${new URL(this.baConfigService.rabbitMq.uri).host}`,
    )
  }
}
