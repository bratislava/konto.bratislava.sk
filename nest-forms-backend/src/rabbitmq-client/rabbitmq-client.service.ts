import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable, Logger } from '@nestjs/common'
import { Options, Replies } from 'amqplib'

import { GinisCheckNasesPayloadDto } from '../ginis/dtos/ginis.response.dto'
import { RabbitPayloadDto } from '../nases-consumer/nases-consumer.dto'
import { RABBIT_MQ, RABBIT_NASES } from '../utils/constants'

@Injectable()
export default class RabbitmqClientService {
  private readonly logger: Logger

  constructor(private readonly amqpConnection: AmqpConnection) {
    this.logger = new Logger('RabbitmqClientService')
  }

  public async publish(message: RabbitPayloadDto): Promise<Replies.Empty> {
    this.logger.debug(
      `Publishing rabbit message to: ${RABBIT_MQ.EXCHANGE} with routing key: ${RABBIT_MQ.ROUTING_KEY}`,
    )
    return this.amqpConnection.publish(
      RABBIT_MQ.EXCHANGE,
      RABBIT_MQ.ROUTING_KEY,
      message,
    )
  }

  public async publishDelay(
    message: RabbitPayloadDto,
    delay: number,
  ): Promise<Replies.Empty> {
    this.logger.debug({
      message: 'publishing delayed rabbit message',
      content: message,
    })
    return this.amqpConnection.publish(
      RABBIT_MQ.EXCHANGE,
      RABBIT_MQ.QUEUE,
      message,
      {
        headers: {
          'x-delay': delay,
        },
      },
    )
  }

  public async publishNasesCheck(
    message: GinisCheckNasesPayloadDto,
  ): Promise<Replies.Empty> {
    this.logger.debug(
      `Publishing nases check message to: ${RABBIT_MQ.EXCHANGE} with routing key: ${RABBIT_NASES.ROUTING_KEY}`,
    )
    return this.amqpConnection.publish(
      RABBIT_MQ.EXCHANGE,
      RABBIT_NASES.ROUTING_KEY,
      message,
      {
        headers: {
          'x-delay': 20_000,
          // 'x-delay': 60_000,
          // TODO change back when NASES getting messages will be fixed
        },
      },
    )
  }

  public async publishMessageRoutingKey(
    routingKey: string,
    message: object,
    options?: Options.Publish,
  ): Promise<boolean> {
    return this.amqpConnection.publish(
      RABBIT_MQ.EXCHANGE,
      routingKey,
      message,
      options,
    )
  }
}
