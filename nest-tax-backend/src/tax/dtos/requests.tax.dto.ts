import { ApiProperty } from '@nestjs/swagger'
import { TaxDetailareaType, TaxDetailType } from '@prisma/client'

export enum TaxDetailTypeEnum {
  APARTMENT = 'APARTMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  GROUND = 'GROUND',
}

export enum TaxDetailareaTypeEnum {
  NONRESIDENTIAL = 'NONRESIDENTIAL',
  RESIDENTIAL = 'RESIDENTIAL',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  jH = 'jH',
  jI = 'jI',
  byt = 'byt',
  nebyt = 'nebyt',
}

export enum TaxPaidStatusEnum {
  NOT_PAID = 'NOT_PAYED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVER_PAID = 'OVER_PAID',
}

export class ResponseTaxPayerDto {
  @ApiProperty({
    description: 'Numeric id of tax payer',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Uuid of tax payer',
    default: '15fc5751-d5e2-4e14-9f8d-dc4b3e1dec27',
  })
  uuid: string

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Is tax payer active',
    default: true,
  })
  active: boolean

  @ApiProperty({
    description: 'Permanent address of tax payer',
    default: 'Bratislava, Hlavne námestie 1',
  })
  permanentResidenceAddress: string

  @ApiProperty({
    description: 'Id of tax payer from Noris',
    default: '12345',
  })
  externalId: string

  @ApiProperty({
    description: 'Name of taxpayer',
    default: 'Bratislavčan Daňový',
  })
  name: string

  @ApiProperty({
    description: 'Text of descreption of name for pdf',
    default: 'Meno daňovníka/ subjektu',
  })
  nameTxt: string

  @ApiProperty({
    description: 'Text of descreption of street for pdf',
    default: 'Ulica trvalého pobytu',
  })
  permanentResidenceStreetTxt: string

  @ApiProperty({
    description: 'Street of permanent residence with number',
    default: 'Uršulínska 6 3/6',
  })
  permanentResidenceStreet: string

  @ApiProperty({
    description: 'Zip of permanent residence with number',
    default: '811 01',
  })
  permanentResidenceZip: string

  @ApiProperty({
    description: 'City of permanent residence with number',
    default: 'Bratislava',
  })
  permanentResidenceCity: string

  // TODO more missing properties which are sent
  @ApiProperty({
    description: 'Birth number with slash',
    default: '920101/1111',
  })
  birthNumber: string
}

export class ResponseTaxDetailInstallmentsDto {
  @ApiProperty({
    description: 'Id of instalments, installments are ordered by this value',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Numeric id of tax (foreign key)',
    default: 1,
  })
  taxId: number

  @ApiProperty({
    description: 'Order of installment',
    default: null,
    nullable: true,
  })
  order: string | null

  @ApiProperty({
    description: 'Amount to pay of installment in cents - integer',
    default: 1000,
  })
  amount: number

  @ApiProperty({
    description: 'Text of number of installment',
    default: 1000,
  })
  text: string
}

export class ResponseTaxDetailsDto {
  @ApiProperty({
    description: 'Numeric id of tax detail',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Numeric id of tax (foreign key)',
    default: 1,
  })
  taxId: number

  @ApiProperty({
    description: 'Type of tax detail - object of tax',
    default: TaxDetailType.GROUND,
    enumName: 'TaxDetailTypeEnum',
    enum: TaxDetailType,
  })
  type: TaxDetailType

  @ApiProperty({
    description: 'Area type of tax detail - exact type of object of tax',
    default: TaxDetailareaType.byt,
    enumName: 'TaxDetailTypeEnum',
    enum: TaxDetailType,
  })
  areaType: TaxDetailareaType

  @ApiProperty({
    description: 'Area of tax detail - square meters',
    default: '0,00',
  })
  area: string

  @ApiProperty({
    description: 'Base of tax pare meter',
    default: 0,
  })
  base: number

  @ApiProperty({
    description: 'Real tax per area type tax detail',
    default: 0,
  })
  amount: number
}

export class ResponseTaxEmployeesDto {
  @ApiProperty({
    description: 'Numeric id of Employee from noris',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'External of employee',
    default: '12562',
  })
  externalId: string

  @ApiProperty({
    description: 'Name of employee',
    default: 'Zamestnanec Bratislavský',
  })
  name: string

  @ApiProperty({
    description: 'Phone number of employee',
    default: '+421 000 000 000',
  })
  phoneNumber: string

  @ApiProperty({
    description: 'Email of employee',
    default: 'zamestnanec.bratislavsky@bratislava.sk',
  })
  email: string
}

export class ResponseTaxDto {
  @ApiProperty({
    description: 'Numeric id of tax',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Uuid of tax',
    default: '15fc5751-d5e2-4e14-9f8d-dc4b3e1dec27',
  })
  uuid: string

  @ApiProperty({
    description: 'Created at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Updated at timestamp',
    default: '2023-04-13T14:39:49.004Z',
  })
  updatedAt: Date

  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  year: number

  @ApiProperty({
    description: 'Numeric id of taxpayer',
    default: 1,
  })
  taxPayerId: number

  @ApiProperty({
    description: 'Amount to pay in cents - integer',
    default: 1000,
  })
  amount: number

  @ApiProperty({
    description: 'Amount which was already payed in cents - integer',
    default: 1000,
  })
  payedAmount: number

  @ApiProperty({
    description: 'Variable symbol of payment',
    default: 12_345_678,
  })
  variableSymbol: string

  @ApiProperty({
    description: 'Id of tax employee - id is from Noris',
    default: 5_172_727,
  })
  taxEmployeeId: number

  @ApiProperty({
    description: 'Tax Id from order of exact year',
    default: '1234',
  })
  taxId: string

  @ApiProperty({
    description: 'Date of tax order.',
    default: '2022-01-01',
  })
  dateCreateTax: string

  @ApiProperty({
    description: 'Part of tax amount for lands in cents in Eur.',
    default: '1000',
  })
  taxLand: number

  @ApiProperty({
    description: 'Part of tax amount for constructions in cents in Eur.',
    default: '1000',
  })
  taxConstructions: number

  @ApiProperty({
    description: 'Part of tax amount for flats in cents in Eur.',
    default: '1000',
  })
  taxFlat: number

  @ApiProperty({
    description:
      'Qr code use for pay in web in Base64 representing image of paybysquare QRcode',
    default: 'somebase64string',
  })
  qrCodeWeb: string

  @ApiProperty({
    description:
      'Qr code use for pay in email in Base64 representing image of paybysquare QRcode',
    default: 'somebase64string',
  })
  qrCodeEmail: string

  @ApiProperty({
    description: 'Type of paid status',
    example: TaxPaidStatusEnum.PARTIALLY_PAID,
    enumName: 'TaxPaidStatusEnum',
    enum: TaxPaidStatusEnum,
  })
  paidStatus: TaxPaidStatusEnum

  @ApiProperty({
    description:
      'Is tax payable (is tax from this year), and frontend can show payment data?',
    example: true,
  })
  isPayable: boolean

  @ApiProperty({
    description:
      'Whether PDF export is available, since 2024 we stopped generating PDFs',
    default: false,
  })
  pdfExport: boolean

  @ApiProperty({
    description: 'Tax payer data',
    default: {
      id: 1,
      uuid: '15fc5751-d5e2-4e14-9f8d-dc4b3e1dec27',
      createdAt: '2023-04-13T14:39:49.004Z',
      updatedAt: '2023-04-13T14:39:49.004Z',
      active: true,
      permanentResidenceAddress: 'Bratislava, Hlavné námestie 1',
      externalId: '1234',
      name: 'Bratislavčan Daňový',
      nameTxt: 'Meno daňovníka',
      permanentResidenceStreetTxt: 'TRvalý pobyt',
      permanentResidenceStreet: 'Uršulínska 6 3/4',
      permanentResidenceZip: '811 01',
      permanentResidenceCity: 'BRatislava',
    },
  })
  taxPayer: ResponseTaxPayerDto

  @ApiProperty({
    description:
      'Installments of payment tax - it can be array of 1 value or 3 values',
    default: [
      {
        id: 1,
        createdAt: '2023-04-13T14:39:49.004Z',
        updatedAt: '2023-04-13T14:39:49.004Z',
        taxId: 1,
        order: null,
        amount: 1000,
        text: 'Splátka 1',
      },
    ],
  })
  taxInstallments: ResponseTaxDetailInstallmentsDto[]

  @ApiProperty({
    description: 'Tax employee',
    default: [
      {
        id: 20,
        createdAt: '2023-04-13T14:39:49.004Z',
        updatedAt: '2023-04-13T14:39:49.004Z',
        taxId: 1,
        type: 'APARTMENT',
        areaType: 'nebyt',
        area: null,
        base: 0,
        amount: 0,
      },
    ],
  })
  taxDetails: ResponseTaxDetailsDto[]

  @ApiProperty({
    description: 'Tax into details on area type',
    default: {
      id: 1,
      createdAt: '2023-04-13T14:39:49.004Z',
      updatedAt: '2023-04-13T14:39:49.004Z',
      externalId: '1234',
      name: 'Zamestnanec Bratsilavský',
      phoneNumber: '+421 000 000 000',
      email: 'zamestnanec.bratislavsky@bratislava.sk',
    },
  })
  taxEmployees: ResponseTaxEmployeesDto

  @ApiProperty({
    description:
      'When were last checked payments for this tax with automatic task.',
    default: '2023-04-13T14:39:49.004Z',
  })
  lastCheckedPayments: Date
}

export class ResponseGetTaxesBodyDto {
  @ApiProperty({
    description: 'Numeric id of tax',
    default: 1,
  })
  id: number

  @ApiProperty({
    description: 'Uuid of tax',
    default: '00000000-0000-0000-0000-000000000000',
  })
  uuid: string

  @ApiProperty({
    description: 'Date of tax creation in backend',
    default: '2024-01-01',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Amount to paid in cents',
    default: 1000,
  })
  amount: number

  @ApiProperty({
    description: 'Year of tax',
    default: 2022,
  })
  year: number

  @ApiProperty({
    description: 'Amount already paid',
    default: 900,
  })
  paidAmount: number

  @ApiProperty({
    description: 'Type of paid status',
    example: TaxPaidStatusEnum.PARTIALLY_PAID,
    enumName: 'TaxPaidStatusEnum',
    enum: TaxPaidStatusEnum,
  })
  paidStatus: TaxPaidStatusEnum

  @ApiProperty({
    description:
      'Is tax payable (is tax from this year), and frontend can show payment data?',
    example: true,
  })
  isPayable: boolean
}

export class ResponseGetTaxesDto {
  @ApiProperty({
    description: 'Birth number of user is in Noris actual or historical Tax',
    example: true,
  })
  isInNoris: boolean

  @ApiProperty({
    isArray: true,
    type: ResponseGetTaxesBodyDto,
  })
  items: ResponseGetTaxesBodyDto[]
}