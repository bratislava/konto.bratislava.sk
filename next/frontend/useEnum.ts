import { useQuery } from '@tanstack/react-query'
import { SelectOption } from 'components/forms/widget-components/SelectField/SelectOption.interface'

import { getEnum } from './api'

export default function useEnum(id?: string) {
  return useQuery<SelectOption[]>(['enums', id], () => getEnum(id))
}
