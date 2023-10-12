// Inspired by https://jfranciscosousa.com/blog/validating-environment-variables-with-zod/
// Secures typesafe access to environmental variables.
// In browser process.env is an empty object, the values are replaced during the build time, so they need to be accessed
// via process.env.NEXT_PUBLIC_...

/* eslint-disable no-process-env */
function assertEnv<T>(variable: string, value: T) {
  if (!value) {
    throw new Error(`Missing environment variable: ${variable}`)
  }
  return value
}

export const environment = {
  nodeEnv: assertEnv('NODE_ENV', process.env.NODE_ENV),
  isStaging: assertEnv('NEXT_PUBLIC_IS_STAGING', process.env.NEXT_PUBLIC_IS_STAGING) === 'true',
  cognitoUserPoolId: assertEnv(
    'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  ),
  cognitoClientId: assertEnv(
    'NEXT_PUBLIC_COGNITO_CLIENT_ID',
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  ),
  cognitoIdentityPoolId: assertEnv(
    'NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID',
    process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
  ),
  cognitoCookieStorageDomain: assertEnv(
    'NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN',
    process.env.NEXT_PUBLIC_COGNITO_COOKIE_STORAGE_DOMAIN,
  ),
  awsRegion: assertEnv('NEXT_PUBLIC_AWS_REGION', process.env.NEXT_PUBLIC_AWS_REGION),
  formsUrl: assertEnv('NEXT_PUBLIC_FORMS_URL', process.env.NEXT_PUBLIC_FORMS_URL),
  cityAccountUrl: assertEnv(
    'NEXT_PUBLIC_CITY_ACCOUNT_URL',
    process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL,
  ),
  taxesUrl: assertEnv('NEXT_PUBLIC_TAXES_URL', process.env.NEXT_PUBLIC_TAXES_URL),
  slovenskoSkLoginUrl: assertEnv(
    'NEXT_PUBLIC_SLOVENSKO_SK_LOGIN_URL',
    process.env.NEXT_PUBLIC_SLOVENSKO_SK_LOGIN_URL,
  ),
  cloudflareTurnstileSiteKey: assertEnv(
    'NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY',
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
  ),
  faroSecret: assertEnv('NEXT_PUBLIC_FARO_SECRET', process.env.NEXT_PUBLIC_FARO_SECRET),
  featureToggles: {
    forms:
      assertEnv(
        'NEXT_PUBLIC_FEATURE_TOGGLE_FORMS',
        process.env.NEXT_PUBLIC_FEATURE_TOGGLE_FORMS,
      ) === 'true',
    formsInMenu:
      assertEnv(
        'NEXT_PUBLIC_FEATURE_TOGGLE_FORMS_IN_MENU',
        process.env.NEXT_PUBLIC_FEATURE_TOGGLE_FORMS_IN_MENU,
      ) === 'true',
    pravnickaOsobaRegistration:
      assertEnv(
        // eslint-disable-next-line no-secrets/no-secrets
        'NEXT_PUBLIC_FEATURE_TOGGLE_PRAVNICKA_OSOBA_REGISTRATION',
        process.env.NEXT_PUBLIC_FEATURE_TOGGLE_PRAVNICKA_OSOBA_REGISTRATION,
      ) === 'true',
    priznanieKDaniZNehnutelnostiPreview:
      assertEnv(
        'NEXT_PUBLIC_FEATURE_TOGGLE_PRIZNANIE_K_DANI_Z_NEHNUTELNOSTI_PREVIEW',
        process.env.NEXT_PUBLIC_FEATURE_TOGGLE_PRIZNANIE_K_DANI_Z_NEHNUTELNOSTI_PREVIEW,
      ) === 'true',
  },
  formsMimetypes: assertEnv(
    'NEXT_PUBLIC_FORMS_MIMETYPE_WHITELIST',
    process.env.NEXT_PUBLIC_FORMS_MIMETYPE_WHITELIST,
  ).split(' '),
  formsMaxSize: Number(
    assertEnv('NEXT_PUBLIC_FORMS_MAX_FILE_SIZE', process.env.NEXT_PUBLIC_FORMS_MAX_FILE_SIZE),
  ),
}
