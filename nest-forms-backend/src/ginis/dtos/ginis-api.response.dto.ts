import { ApiProperty } from '@nestjs/swagger'

import { GinisDocumentChangeType } from '../../utils/ginis/ginis-api-helper'

class GinisSdkHistorieDokumentuWithAssignedCategory {
  IdDokumentu: string

  Atribut_IdDokumentu_Externi: string

  TextZmeny: string

  Poznamka: string

  DatumZmeny: string

  IdZmenuProvedl: string

  Atribut_IdZmenuProvedl_Externi: string

  IdKtgZmeny: string

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
