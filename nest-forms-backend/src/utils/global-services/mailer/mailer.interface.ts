import { Readable } from 'node:stream'

import { SendEmailInputDto } from '../../global-dtos/mailgun.dto'

export interface MailerSendEmailParams {
  data: SendEmailInputDto
  emailFrom?: string
  subject?: string
  attachments?: { filename: string; content: Buffer | Readable }[]
}

export interface Mailer {
  sendEmail(args: MailerSendEmailParams): Promise<void>
}
