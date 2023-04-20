// TODO kept to be an easy search-and-replace in case of change, remove when done
type DateString = string

export interface Tax {
  id: number
  uuid: string
  createdAt: DateString
  updatedAt: DateString
  year: number
  taxPayerId: number
  amount: number
  payedAmount: number
  variableSymbol: string
  taxEmployeeId: number
  taxId: string
  dateCreateTax: DateString
  taxLand: number
  taxConstructions: number
  taxFlat: number
  qrCodeWeb: string
  qrCodeEmail: string
  taxPayer: TaxPayer
  taxInstallments: TaxInstallment[]
  taxDetails: TaxDetail[]
  taxEmployees: TaxEmployees
}

export interface TaxDetail {
  id: number
  createdAt: DateString
  updatedAt: DateString
  taxId: number
  type: string
  areaType: string
  area: string | null
  base: number
  amount: number
}

export interface TaxEmployees {
  id: number
  createdAt: DateString
  updatedAt: DateString
  externalId: string
  name: string
  phoneNumber: string
  email: string
}

export interface TaxInstallment {
  id: number
  createdAt: DateString
  updatedAt: DateString
  taxId: number
  order: number | null
  amount: number
  text: string
}

export interface TaxPayer {
  id: number
  uuid: string
  createdAt: DateString
  updatedAt: DateString
  active: boolean
  permanentResidenceAddress: string
  externalId: string
  name: string
  nameTxt: string
  permanentResidenceStreetTxt: string
  permanentResidenceStreet: string
  permanentResidenceZip: string
  permanentResidenceCity: string | null
}

export const TaxJSONSchema = {
  $ref: '#/definitions/Tax',
  definitions: {
    Tax: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer',
        },
        uuid: {
          type: 'string',
          format: 'uuid',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        year: {
          type: 'integer',
        },
        taxPayerId: {
          type: 'integer',
        },
        amount: {
          type: 'integer',
        },
        payedAmount: {
          type: 'integer',
        },
        variableSymbol: {
          type: 'string',
        },
        taxEmployeeId: {
          type: 'integer',
        },
        taxId: {
          type: 'string',
        },
        dateCreateTax: {
          type: 'string',
        },
        taxLand: {
          type: 'integer',
        },
        taxConstructions: {
          type: 'integer',
        },
        taxFlat: {
          type: 'integer',
        },
        qrCodeWeb: {
          type: 'string',
        },
        qrCodeEmail: {
          type: 'string',
        },
        taxPayer: {
          $ref: '#/definitions/TaxPayer',
        },
        taxInstallments: {
          type: 'array',
          items: {
            $ref: '#/definitions/TaxInstallment',
          },
        },
        taxDetails: {
          type: 'array',
          items: {
            $ref: '#/definitions/TaxDetail',
          },
        },
        taxEmployees: {
          $ref: '#/definitions/TaxEmployees',
        },
      },
      required: [
        'amount',
        'createdAt',
        'dateCreateTax',
        'id',
        'payedAmount',
        'qrCodeEmail',
        'qrCodeWeb',
        'taxConstructions',
        'taxDetails',
        'taxEmployeeId',
        'taxEmployees',
        'taxFlat',
        'taxId',
        'taxInstallments',
        'taxLand',
        'taxPayer',
        'taxPayerId',
        'updatedAt',
        'uuid',
        'variableSymbol',
        'year',
      ],
      title: 'Tax',
    },
    TaxDetail: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        taxId: {
          type: 'integer',
        },
        type: {
          type: 'string',
        },
        areaType: {
          type: 'string',
        },
        area: {
          type: ['null', 'string'],
        },
        base: {
          type: 'integer',
        },
        amount: {
          type: 'integer',
        },
      },
      required: [
        'amount',
        'area',
        'areaType',
        'base',
        'createdAt',
        'id',
        'taxId',
        'type',
        'updatedAt',
      ],
      title: 'TaxDetail',
    },
    TaxEmployees: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        externalId: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        phoneNumber: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
      },
      required: ['createdAt', 'email', 'externalId', 'id', 'name', 'phoneNumber', 'updatedAt'],
      title: 'TaxEmployees',
    },
    TaxInstallment: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        taxId: {
          type: 'integer',
        },
        order: {
          type: ['number', 'null'],
        },
        amount: {
          type: 'integer',
        },
        text: {
          type: 'string',
        },
      },
      required: ['amount', 'createdAt', 'id', 'order', 'taxId', 'text', 'updatedAt'],
      title: 'TaxInstallment',
    },
    TaxPayer: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer',
        },
        birthNumber: {
          type: 'string',
        },
        uuid: {
          type: 'string',
          format: 'uuid',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
        },
        active: {
          type: 'boolean',
        },
        permanentResidenceAddress: {
          type: 'string',
        },
        externalId: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        nameTxt: {
          type: 'string',
        },
        permanentResidenceStreetTxt: {
          type: 'string',
        },
        permanentResidenceStreet: {
          type: 'string',
        },
        permanentResidenceZip: {
          type: 'string',
        },
        permanentResidenceCity: {
          type: ['string', 'null'],
        },
      },
      required: [
        'active',
        'createdAt',
        'externalId',
        'id',
        'name',
        'nameTxt',
        'permanentResidenceAddress',
        'permanentResidenceCity',
        'permanentResidenceStreet',
        'permanentResidenceStreetTxt',
        'permanentResidenceZip',
        'updatedAt',
        'uuid',
      ],
      title: 'TaxPayer',
    },
  },
}
