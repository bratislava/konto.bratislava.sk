import { Readable } from 'node:stream'

import { SendEmailInputDto } from '../../global-dtos/mailgun.dto'

export type MailerSendEmailParams = {
  data: SendEmailInputDto
  emailFrom?: string
  attachments?: { filename: string; content: Buffer | Readable }[]
}

export interface Mailer {
  sendEmail(args: MailerSendEmailParams): Promise<void>
}
