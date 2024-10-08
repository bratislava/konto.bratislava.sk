export const ROUTES = {
  HOME: '/',
  REGISTER: '/registracia',
  IDENTITY_VERIFICATION: '/overenie-identity',
  LOGIN: '/prihlasenie',
  LOGOUT: '/odhlasenie',
  FORGOTTEN_PASSWORD: '/zabudnute-heslo',
  PASSWORD_CHANGE: '/zmena-hesla',
  HELP: '/pomoc',
  TAXES_AND_FEES: '/dane-a-poplatky',
  TAXES_AND_FEES_YEAR: (year: number) => `/dane-a-poplatky/${year}`,
  MUNICIPAL_SERVICES: '/mestske-sluzby',
  MUNICIPAL_SERVICES_FORM: (formSlug: string) => `/mestske-sluzby/${formSlug}`,
  MUNICIPAL_SERVICES_FORM_WITH_ID: (formSlug: string, formId: string) =>
    `/mestske-sluzby/${formSlug}/${formId}`,
  THANK_YOU: '/vysledok-platby',
  USER_PROFILE: '/moj-profil',
  MY_APPLICATIONS: '/moje-ziadosti',
  PAYMENT_RESULT: '/platba/stav',
}
