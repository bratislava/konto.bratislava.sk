import { LineLoggerSubservice, LogAllowList } from '@bratislava/log-nest'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import WebhookDto from '../form-delivery-consumer/dtos/webhook.dto'

@ApiTags('webhook')
@Controller('webhook')
export default class WebhookController {
  constructor(private readonly logger: LineLoggerSubservice) {}

  @ApiOkResponse({})
  @ApiOperation({
    summary: 'Receive webhook data',
    description: 'Endpoint to receive webhook data and log it',
  })
  @LogAllowList({ formId: true, slug: true, jsonVersion: true })
  @Post()
  receiveWebhook(@Body() data: WebhookDto): void {
    this.logger.log('Received webhook data successfully', {
      formId: data.formId,
    })
  }
}
