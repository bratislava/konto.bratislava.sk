import { GinisDocumentDetailResponseDto } from '@clients/openapi-forms'

export const modifyGinisDataForSchemaSlug = (
  data: GinisDocumentDetailResponseDto | null,
  schemaSlug: string | undefined,
): GinisDocumentDetailResponseDto | null => {
  if (!data || !schemaSlug) return data
  // schemas for which we filter out contact of the person processing them
  if (
    ['stanovisko-k-investicnemu-zameru', 'zavazne-stanovisko-k-investicnej-cinnosti'].includes(
      schemaSlug,
    )
  )
    return {
      ...data,
      ownerEmail: 'usmernovanievystavby@bratislava.sk',
      ownerName: '',
      ownerPhone: '',
    }
  return data
}
