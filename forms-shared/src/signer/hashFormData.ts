import type { GenericObjectType } from '@rjsf/utils' with {
  'resolution-mode': 'import',
}
import objectHash from 'object-hash'

export const hashFormData = (formData: GenericObjectType) => objectHash(formData)
