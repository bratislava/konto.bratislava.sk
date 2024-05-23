import * as process from 'node:process'

import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { RABBIT_GINIS_AUTOMATION, RABBIT_MQ } from '../utils/constants'
import RabbitmqClientService from './rabbitmq-client.service'

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('RABBIT_MQ_URI') ?? '',
        exchanges: [
          {
            name: RABBIT_MQ.EXCHANGE,
            type: 'x-delayed-message',
            options: {
              arguments: { 'x-delayed-type': 'direct' },
            },
          },
          {
            name: RABBIT_GINIS_AUTOMATION.EXCHANGE,
            type: 'x-delayed-message',
            options: {
              arguments: { 'x-delayed-type': 'direct' },
            },
          },
        ],
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RabbitmqClientService],
  exports: [RabbitmqClientService, RabbitMQModule],
})
export default class RabbitmqClientModule {
  private readonly logger: Logger

  constructor(
    private rabbitmqClientService: RabbitmqClientService,
    private amqpConnection: AmqpConnection,
  ) {
    this.rabbitmqClientService = new RabbitmqClientService(amqpConnection)
    this.logger = new Logger('RabbitmqClientModule')
    this.logger.log(
      `Setting up rabbit mq connection to: ${<string>(
        process.env.RABBIT_MQ_URI
      )}`,
    )
  }
}
