import { Ginis } from '@bratislava/ginis-sdk'

// helper types (until fixed in ginis-sdk)
export type DetailDokumentu = Awaited<
  ReturnType<InstanceType<typeof Ginis>['json']['ssl']['detailDokumentu']>
>
export type DetailFunkcnihoMista = Awaited<
  ReturnType<InstanceType<typeof Ginis>['json']['gin']['detailFunkcnihoMista']>
>
export type DetailReferenta = Awaited<
  ReturnType<InstanceType<typeof Ginis>['json']['gin']['detailReferenta']>
>

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
  DetailDokumentu['HistorieDokumentu'][number] & {
    assignedCategory: GinisDocumentChangeType
  }
export type MappedDocumentHistory =
  Array<DocumentHistoryElementWithAssignedCategory>

// likely more functions will be added to this file
export const mapGinisHistory = (
  document: DetailDokumentu,
): Array<DocumentHistoryElementWithAssignedCategory> =>
  // document history contains events such as "this document was viewed by someone"
  // we want to filter the uninteresting ones out
  // we also want to map to a small-enough enum of types of changes which FE can reference from here
  document.HistorieDokumentu.filter((historyElement) =>
    validIdKtgZmeny.includes(historyElement.IdKtgZmeny),
  ).map((historyElement) => ({
    ...historyElement,
    assignedCategory:
      idKtgZmenyToGinisDocumentChangeType[
        historyElement.IdKtgZmeny as ValidIdKtgZmeny
      ],
  }))
