import { deliveryMethodSetToNotificationHtml } from './delivery-method-set-to-notification.template'

export const pdfTemplates = {
  'delivery-method-set-to-notification': {
    html: deliveryMethodSetToNotificationHtml,
    variables: ['name', 'email', 'birthNumber', 'date'],
  },
} as const satisfies Record<string, { html: string; variables: readonly string[] }>

export type PdfTemplateKeys = keyof typeof pdfTemplates

export type PdfTemplateVariables<T extends PdfTemplateKeys> = {
  [P in (typeof pdfTemplates)[T]['variables'][number]]: string
}
