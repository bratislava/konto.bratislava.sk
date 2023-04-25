import { useQuery } from '@tanstack/react-query'
import { getEnum } from '@utils/api'
import { SelectOption } from 'components/forms/widget-components/SelectField/SelectOption.interface'

export default function useEnum(id?: string) {
  return useQuery<SelectOption[]>(['enums', id], () => getEnum(id))
}
