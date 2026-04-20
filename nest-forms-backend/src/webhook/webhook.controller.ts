import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import WebhookDto from '../nases-consumer/subservices/dtos/webhook.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@ApiTags('webhook')
@Controller('webhook')
export default class WebhookController {
  private readonly logger: LineLoggerSubservice = new LineLoggerSubservice(
    WebhookController.name,
  )

  @ApiOkResponse({})
  @ApiOperation({
    summary: 'Receive webhook data',
    description: 'Endpoint to receive webhook data and log it',
  })
  @Post()
  receiveWebhook(@Body() data: WebhookDto): void {
    this.logger.log('Received webhook data successfully', {
      formId: data.formId,
    })
  }
}
