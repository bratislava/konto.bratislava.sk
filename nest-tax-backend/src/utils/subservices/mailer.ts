import FormData from 'form-data'
import Mailgun from 'mailgun.js'

const mailgun = new Mailgun(FormData)
const mailgunClient = mailgun.client({
  url: process.env.MAILGUN_HOST,
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
})

export const sendTaxConfirmationEmail = async ({
  to,
  subject,
  data,
  template,
}) => {
  const mailData = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    template,
    'h:X-Mailgun-Variables': JSON.stringify(data),
  }
  await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, mailData)
  console.info(
    `Conf email was sent with template ${template} to ${process.env.EMAIL_FROM}`,
  )
}
