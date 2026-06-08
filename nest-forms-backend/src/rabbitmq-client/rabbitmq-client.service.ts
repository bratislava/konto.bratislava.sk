import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Replies } from 'amqplib'

import { RabbitPayloadDto } from '../form-delivery-consumer/dtos/form-delivery-consumer.dto'
import { GinisCheckDeliveryPayloadDto } from '../ginis/dtos/ginis.response.dto'
import { RABBIT_FORM_DELIVERY, RABBIT_GINIS } from '../utils/constants'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@Injectable()
export default class RabbitmqClientService {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly amqpConnection: AmqpConnection) {
    this.logger = new LineLoggerSubservice('RabbitmqClientService')
  }

  public async publish(message: RabbitPayloadDto): Promise<Replies.Empty> {
    this.logger.debug(
      `Publishing rabbit message to: ${RABBIT_FORM_DELIVERY.EXCHANGE} with routing key: ${RABBIT_FORM_DELIVERY.ROUTING_KEY}`,
    )
    return this.amqpConnection.publish(
      RABBIT_FORM_DELIVERY.EXCHANGE,
      RABBIT_FORM_DELIVERY.ROUTING_KEY,
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
      RABBIT_FORM_DELIVERY.EXCHANGE,
      RABBIT_FORM_DELIVERY.QUEUE,
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
    message: GinisCheckDeliveryPayloadDto,
  ): Promise<Replies.Empty> {
    this.logger.debug(
      `Publishing send to ginis message to: ${RABBIT_FORM_DELIVERY.EXCHANGE} with routing key: ${RABBIT_GINIS.ROUTING_KEY}`,
    )
    return this.amqpConnection.publish(
      RABBIT_FORM_DELIVERY.EXCHANGE,
      RABBIT_GINIS.ROUTING_KEY,
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
}
