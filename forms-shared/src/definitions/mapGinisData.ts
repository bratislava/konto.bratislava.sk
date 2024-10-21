export interface GinisDataBase {
  // dossierId coming from data is always incorrect - TODO fix this together with the rest of the detail page
  dossierId: string
  ownerEmail: string
  ownerName: string
  ownerPhone: string
}

// We don't have any direction for other schemas, but we have a few complaints, so playing it safe until the details page is fixed.
export const mapGinisDataDefault = <GinisData extends GinisDataBase>(ginisData: GinisData) => {
  return {
    ...ginisData,
    dossierId: '',
    ownerEmail: 'info@bratislava.sk',
    ownerName: '',
    ownerPhone: '',
  }
}

// SUR forms want to direct support through single support email.
export const mapGinisDataSur = <GinisData extends GinisDataBase>(ginisData: GinisData) => {
  return {
    ...ginisData,
    dossierId: '',
    ownerEmail: 'usmernovanievystavby@bratislava.sk',
    ownerName: '',
    ownerPhone: '',
  }
}

// Taxes want to share the contact for referents (as far as we know).
export const mapGinisDataPriznanieKDaniZNehnutelnosti = <GinisData extends GinisDataBase>(
  ginisData: GinisData,
) => {
  return {
    ...ginisData,
    dossierId: '',
  }
}
