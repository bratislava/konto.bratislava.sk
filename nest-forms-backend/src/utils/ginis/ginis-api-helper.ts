import {
  SslDetailDokumentuHistorieDokumentuItem,
  SslDetailDokumentuResponse,
} from '@bratislava/ginis-sdk'

export enum GinisDocumentChangeType {
  DOCUMENT_CREATED = 'DOCUMENT_CREATED',
}

// we use this to filter out only that changes we're interested in and assign constants to use for mapping on FE
const idKtgZmenyToGinisDocumentChangeType = {
  // TODO after testing this does not really work (idKtg is not a good attribute to filter by)
  // keeping this as an example, will update this object and mapGinisHistory once we have more info
  '1010': GinisDocumentChangeType.DOCUMENT_CREATED,
} as const

const validIdKtgZmeny = Object.keys(idKtgZmenyToGinisDocumentChangeType)
type ValidIdKtgZmeny = keyof typeof idKtgZmenyToGinisDocumentChangeType

type DocumentHistoryElementWithAssignedCategory =
  SslDetailDokumentuHistorieDokumentuItem & {
    assignedCategory: GinisDocumentChangeType
  }
export type MappedDocumentHistory =
  Array<DocumentHistoryElementWithAssignedCategory>

// likely more functions will be added to this file
export const mapGinisHistory = (
  document: SslDetailDokumentuResponse,
): Array<DocumentHistoryElementWithAssignedCategory> =>
  // document history contains events such as "this document was viewed by someone"
  // we want to filter the uninteresting ones out
  // we also want to map to a small-enough enum of types of changes which FE can reference from here
  document['Historie-dokumentu']
    .filter((historyElement) =>
      validIdKtgZmeny.includes(historyElement['Id-ktg-zmeny']),
    )
    .map((historyElement) => ({
      ...historyElement,
      assignedCategory:
        idKtgZmenyToGinisDocumentChangeType[
          historyElement['Id-ktg-zmeny'] as ValidIdKtgZmeny
        ],
    }))
