// TODO this is only for testing here

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Controller, Get, HttpCode } from '@nestjs/common'
import { MailgunService } from './mailgun.service'

@ApiTags('MAILGUN')
@Controller('mailgun')
export class MailgunController {
  constructor(private readonly mailgunService: MailgunService) {}
  @HttpCode(200)
  @ApiOperation({
    summary: 'Test mailgun',
  })
  @Get('test')
  async getUserDataByBirthNumber() {
    await this.mailgunService.generateMailgunPdfAndSendEmail(
      {
        filename: 'Test file.pdf',
        password: '12345',
        templateName: 'delivery-method-set-to-notification',
        templateData: { firstName: 'Jožko', lastName: 'Bezák', birthNumber: '1234567890' },
      },
      {
        to: 'jakub.hvolka@gmail.com',
        variables: {
          firstName: 'Jakub',
          lastName: 'Hvolka',
        },
      }
    )
  }
}
