export enum IsInCityAccount {
  YES = 'A',
  NO = 'N',
}

export enum DeliveryMethod {
  EDESK = 'E', // edesk
  CITY_ACCOUNT = 'O', // city account notification
  POSTAL = 'P', // postal
}

// In Noris, postal delivery method should be saved as 'E', same as eDesk. This comes as a requirement from the Noris system.
// Values intentionally match DeliveryMethod.EDESK and DeliveryMethod.CITY_ACCOUNT.
export enum DeliveryMethodNoris {
  EDESK = 'E',
  CITY_ACCOUNT = 'O',
}

export interface UpdateNorisDeliveryMethods {
  birthNumbers: string[]
  inCityAccount: IsInCityAccount
  deliveryMethod: DeliveryMethod | null
  date: string | null
}

export enum AreaTypesEnum {
  APARTMENT = 'APARTMENT',
  CONSTRUCTION = 'CONSTRUCTION',
  GROUND = 'GROUND',
}
