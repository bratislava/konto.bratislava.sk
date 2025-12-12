import { deliveryMethodSetToNotificationHtml } from './delivery-method-set-to-notification'

export const pdfTemplates = {
  'delivery-method-set-to-notification': {
    html: deliveryMethodSetToNotificationHtml,
    attributes: ['firstName', 'email', 'birthNumber'],
  },
}

export type pdfTemplateKeys = keyof typeof pdfTemplates

export type TemplateAttributes<T extends pdfTemplateKeys> = Record<
  (typeof pdfTemplates)[T]['attributes'][number],
  string
>
