import type { FormSummary as _FormSummary } from 'forms-shared/summary/summary'
import type { GenericObjectType } from '@rjsf/utils'

declare global {
  namespace PrismaJson {
    type FormDataJson = GenericObjectType

    type FormSummary = _FormSummary
  }
}
