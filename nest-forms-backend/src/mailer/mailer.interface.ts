import { Readable } from 'node:stream'

import { SendEmailInputDto } from '../utils/global-dtos/mailgun.dto'

export interface MailerAttachment {
  filename: string
  content: Buffer | Readable
}

export interface MailerSendEmailParams {
  data: SendEmailInputDto
  emailFrom?: string
  replyTo?: string
  subject?: string
  attachments?: MailerAttachment[]
}

export interface Mailer {
  sendEmail(args: MailerSendEmailParams): Promise<void>
}
