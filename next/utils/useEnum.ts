import { useQuery } from '@tanstack/react-query'
import { getEnum } from '@utils/api'

export default function useEnum(id?: string) {
  return useQuery(['enums', id], () => getEnum(id))
}
