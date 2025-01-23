import type { GenericObjectType } from '@rjsf/utils'
import type { FormSignature as _FormSignature } from 'forms-shared/signer/signature'
import type { FormSummary as _FormSummary } from 'forms-shared/summary/summary'

declare global {
  namespace PrismaJson {
    type FormDataJson = GenericObjectType

    type FormSummary = _FormSummary

    type FormSignature = _FormSignature
  }
}
