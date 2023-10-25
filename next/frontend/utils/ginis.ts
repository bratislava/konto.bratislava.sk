import { GinisDocumentDetailResponseDto } from '@clients/openapi-forms'

// any filtering or changes to GINIS data that happen before we "reveal" them to browser
export const modifyGinisDataForSchemaSlug = (
  data: GinisDocumentDetailResponseDto | null,
  schemaSlug: string | undefined,
): GinisDocumentDetailResponseDto | null => {
  if (!data || !schemaSlug) return data
  // schemas for which we filter out contact of the person processing them
  // this is usually because we don't want the subjects who submit the form to contact the person processing them directly
  // instead we want to direct the requests through a single support channel
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
