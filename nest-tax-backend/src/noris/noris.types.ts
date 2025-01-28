export enum IsInCityAccount {
  YES = 'A',
  NO = 'N',
}

export enum DeliveryMethod {
  EDESK = 'E', // edesk
  CITY_ACCOUNT = 'O', // city account notification
  POSTAL = 'P', // postal
}

export interface UpdateNorisDeliveryMethods {
  birthNumbers: string[]
  inCityAccount: IsInCityAccount
  deliveryMethod: DeliveryMethod | null
  date: string | null
}
