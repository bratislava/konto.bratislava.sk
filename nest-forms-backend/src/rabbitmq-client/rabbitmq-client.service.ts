import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Replies } from 'amqplib'

import { GinisCheckNasesPayloadDto } from '../ginis/dtos/ginis.response.dto'
import { RabbitPayloadDto } from '../nases-consumer/nases-consumer.dto'
import {
  RABBIT_GINIS_AUTOMATION,
  RABBIT_MQ,
  RABBIT_NASES,
} from '../utils/constants'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@Injectable()
export default class RabbitmqClientService {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly amqpConnection: AmqpConnection) {
    this.logger = new LineLoggerSubservice('RabbitmqClientService')
  }

  public async publish(message: RabbitPayloadDto): Promise<Replies.Empty> {
    this.logger.debug(
      `Publishing rabbit message to: ${RABBIT_MQ.EXCHANGE} with routing key: ${RABBIT_MQ.ROUTING_KEY}`,
    )
    return this.amqpConnection.publish(
      RABBIT_MQ.EXCHANGE,
      RABBIT_MQ.ROUTING_KEY,
      message,
      {
        contentType: 'application/json',
      },
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
        contentType: 'application/json',
      },
    )
  }

  public async publishToGinis(
    message: GinisCheckNasesPayloadDto,
  ): Promise<Replies.Empty> {
    this.logger.debug(
      `Publishing send to ginis message to: ${RABBIT_MQ.EXCHANGE} with routing key: ${RABBIT_NASES.ROUTING_KEY}`,
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
        contentType: 'application/json',
      },
    )
  }

  public async publishMessageToGinisAutomation(
    routingKey: string,
    message: object,
    replyTo: string,
  ): Promise<boolean> {
    this.logger.log(
      `Publishing message to ginis automation, Exchange: ${RABBIT_GINIS_AUTOMATION.EXCHANGE}, Routing key: ${routingKey}, message: ${JSON.stringify(message)}`,
    )
    return this.amqpConnection.publish(
      RABBIT_GINIS_AUTOMATION.EXCHANGE,
      routingKey,
      message,
      {
        replyTo,
        contentType: 'application/json',
      },
    )
  }
}
