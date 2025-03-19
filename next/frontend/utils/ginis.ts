import { GinisDocumentDetailResponseDto } from 'openapi-clients/forms'

// TODO the whole detail page needs rethinking, currently we barely show anything relevant
// any filtering or changes to GINIS data that happen before we "reveal" them to browser
export const modifyGinisDataForSchemaSlug = (
  data: GinisDocumentDetailResponseDto | null,
  schemaSlug: string | undefined,
): GinisDocumentDetailResponseDto | null => {
  if (!data || !schemaSlug) return data
  // dossierId coming from data is always incorrect - TODO fix this together with the rest of the detail page
  const prefilteredData = { ...data, dossierId: '' }
  // SUR forms want to direct support through single support email
  if (
    ['stanovisko-k-investicnemu-zameru', 'zavazne-stanovisko-k-investicnej-cinnosti'].includes(
      schemaSlug,
    )
  ) {
    return {
      ...prefilteredData,

      ownerEmail: 'usmernovanievystavby@bratislava.sk',
      ownerName: '',
      ownerPhone: '',
    }
  }
  // taxes want to share the contact for referents (as far as we know)
  if (schemaSlug === 'priznanie-k-dani-z-nehnutelnosti') {
    return prefilteredData
  }
  // we don't have any direction for other schemas, but we have a few complaints, so playing it safe until the details page is fixed
  return {
    ...prefilteredData,
    ownerEmail: 'info@bratislava.sk',
    ownerName: '',
    ownerPhone: '',
  }
}
