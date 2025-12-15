import { deliveryMethodSetToNotificationHtml } from './delivery-method-set-to-notification'

export const pdfTemplates = {
  'delivery-method-set-to-notification': {
    html: deliveryMethodSetToNotificationHtml,
    attributes: ['name', 'email', 'birthNumber'],
  },
}

export type PdfTemplateKeys = keyof typeof pdfTemplates

export type TemplateAttributes<T extends PdfTemplateKeys> = Record<
  (typeof pdfTemplates)[T]['attributes'][number],
  string
>
