import { GenericObjectType } from '@rjsf/utils'
import objectHash from 'object-hash'

export const hashFormData = (formData: GenericObjectType) => objectHash(formData)
