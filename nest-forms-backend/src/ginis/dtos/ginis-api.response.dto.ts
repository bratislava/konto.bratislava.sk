import { ApiProperty } from '@nestjs/swagger'

import { GinisDocumentChangeType } from '../../utils/ginis/ginis-api-helper'

class GinisSdkHistorieDokumentuWithAssignedCategory {
  'Id-dokumentu': string

  'Text-zmeny'?: string

  Poznamka?: string

  'Datum-zmeny': string

  'Id-zmenu-provedl': string

  'Id-ktg-zmeny': string

  assignedCategory: GinisDocumentChangeType
}

export default class GinisDocumentDetailResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  dossierId: string

  @ApiProperty()
  ownerName: string

  @ApiProperty()
  ownerEmail: string

  @ApiProperty()
  ownerPhone: string

  @ApiProperty()
  documentHistory: GinisSdkHistorieDokumentuWithAssignedCategory[]
}
