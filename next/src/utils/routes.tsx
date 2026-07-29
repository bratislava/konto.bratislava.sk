import { ResponseGetTaxesListBodyDto } from 'openapi-clients/tax'

export type TaxRouteProps = Pick<ResponseGetTaxesListBodyDto, 'year' | 'type' | 'order'>

export const ROUTES = {
  HOME: '/',
  REGISTER: '/registracia',
  IDENTITY_VERIFICATION: '/overenie-identity',
  LOGIN: '/prihlasenie',
  LOGOUT: '/odhlasenie',

  FORGOTTEN_PASSWORD: '/zabudnute-heslo',
  OAUTH: '/oauth',
  OAUTH_CONFIRM: '/oauth-potvrdenie',

  PASSWORD_CHANGE: '/zmena-hesla',
  EMAIL_CHANGE: '/zmena-emailu',
  HELP: '/pomoc',
  TAXES: '/dane-a-poplatky',
  TAXES_BY_YEAR: (year: number) => `/dane-a-poplatky/${year}`,
  TAXES_TAX_DETAIL: ({ year, type, order }: TaxRouteProps) =>
    `/dane-a-poplatky/${year}/${type}/${order}`,
  TAXES_TAX_PAYMENT: ({ year, type, order }: TaxRouteProps) =>
    `/dane-a-poplatky/${year}/${type}/${order}/platba`,
  MUNICIPAL_SERVICES: '/mestske-sluzby',
  // TODO revisit after landing pages migration
  MUNICIPAL_SERVICES_FORM: (formSlug: string) => `/mestske-sluzby/${formSlug}`,
  MUNICIPAL_SERVICES_FORM_WITH_ID: (formSlug: string, formId: string) =>
    `/mestske-sluzby/${formSlug}/${formId}`,
  THANK_YOU: '/vysledok-platby',
  USER_PROFILE: '/moj-profil',
  MY_APPLICATIONS: '/moje-ziadosti',
  PAYMENT_RESULT: '/platba/stav',
}

/**
 * External links used more than once, to keep them in sync
 */
export const EXTERNAL_LINKS = {
  BRATISLAVA_TAXES_INFO_DZN:
    'https://bratislava.sk/mesto-bratislava/dane-a-poplatky/dan-z-nehnutelnosti',
  BRATISLAVA_TAXES_INFO_KO:
    'https://bratislava.sk/mesto-bratislava/dane-a-poplatky/poplatok-za-komunalne-odpady-a-drobne-stavebne-odpady',
}
