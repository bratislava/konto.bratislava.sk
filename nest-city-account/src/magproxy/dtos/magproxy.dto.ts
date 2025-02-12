import { ResponseRpoLegalPersonDto } from '../../generated-clients/new-magproxy'
import { ResponseErrorInternalDto } from '../../utils/guards/dtos/error.dto'

export interface RfoDataMagproxyDto {
  statusCode: number
  data: RfoDataDataDto | null
  errorData: ResponseErrorInternalDto | null
}

export interface RfoDataDataDto {
  datumUmrtia: string
  doklady: RfoDocumentsDto[]
  ifo: string
  rodneCislo: string
}

interface RfoDocumentsDto {
  druhDokladu: RfoDocumentType
  jednoznacnyIdentifikator: string
  udrzitela: boolean
}

enum RfoDocumentType {
  IDENTITY_CARD = 'Občiansky preukaz',
}

export interface RpoDataMagproxyDto {
  statusCode: number
  data: ResponseRpoLegalPersonDto | null
  errorData: ResponseErrorInternalDto | null
}
