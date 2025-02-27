export const validTypes = [
  'forms',
  'tax',
  'city-account',
  'slovensko-sk',
  'clamav-scanner',
] as const
export type ValidType = (typeof validTypes)[number]

export const endpoints: Record<ValidType, string> = {
  forms: 'https://nest-forms-backend.staging.bratislava.sk/api-json',
  tax: 'https://nest-tax-backend.staging.bratislava.sk/api-json',
  'city-account': 'https://nest-city-account.staging.bratislava.sk/api-json',
  'clamav-scanner': 'https://nest-clamav-scanner.staging.bratislava.sk/api-json',
  'slovensko-sk': 'https://fix.slovensko-sk-api.bratislava.sk/openapi.yaml',
}
