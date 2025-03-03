import { SendMailOptions } from 'nodemailer'

import { SendEmailInputDto } from '../../global-dtos/mailgun.dto'

export interface Mailer {
  sendEmail(
    data: SendEmailInputDto,
    emailFrom?: string,
    attachments?: SendMailOptions['attachments'],
  ): Promise<void>
}
