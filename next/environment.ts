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

function getOriginsArray<T>(variable: string, value: T, required = true) {
  if (required) {
    assertEnv(variable, value)
  }

  if (!value) {
    return []
  }

  const array = (value as string).split(',')
  array.forEach((origin) => {
    let parsedUrl: URL
    try {
      // eslint-disable-next-line no-new
      parsedUrl = new URL(origin)
    } catch (error) {
      throw new Error(`Invalid origin in ${variable}: ${origin} is not a valid URL`)
    }

    // We only want to support strings that are in URL#origin format
    if (parsedUrl.origin !== origin) {
      throw new Error(`Invalid origin in ${variable}: ${origin} is not in URL#origin format`)
    }
  })

  return array
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
  bratislavaStrapiUrl: assertEnv(
    'NEXT_PUBLIC_BRATISLAVA_STRAPI_URL',
    process.env.NEXT_PUBLIC_BRATISLAVA_STRAPI_URL,
  ),
  cityAccountStrapiUrl: assertEnv(
    'NEXT_PUBLIC_CITY_ACCOUNT_STRAPI_URL',
    process.env.NEXT_PUBLIC_CITY_ACCOUNT_STRAPI_URL,
  ),
  cloudflareTurnstileSiteKey: assertEnv(
    'NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY',
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
  ),
  authApprovedOrigins: getOriginsArray(
    'NEXT_PUBLIC_AUTH_APPROVED_ORIGINS',
    process.env.NEXT_PUBLIC_AUTH_APPROVED_ORIGINS,
  ),
  embeddedFormsOloOrigins: getOriginsArray(
    'NEXT_PUBLIC_EMBEDDED_FORMS_OLO_ORIGINS',
    process.env.NEXT_PUBLIC_EMBEDDED_FORMS_OLO_ORIGINS,
    false,
  ),

  faroSecret: assertEnv('NEXT_PUBLIC_FARO_SECRET', process.env.NEXT_PUBLIC_FARO_SECRET),
  featureToggles: {
    developmentForms:
      assertEnv(
        'NEXT_PUBLIC_FEATURE_TOGGLE_DEVELOPMENT_FORMS',
        process.env.NEXT_PUBLIC_FEATURE_TOGGLE_DEVELOPMENT_FORMS,
      ) === 'true',
    taxReportCorrespondenceAddress:
      assertEnv(
        'NEXT_PUBLIC_FEATURE_TOGGLE_TAX_REPORT_CORRESPONDENCE_ADDRESS',
        process.env.NEXT_PUBLIC_FEATURE_TOGGLE_TAX_REPORT_CORRESPONDENCE_ADDRESS,
      ) === 'true',
    eIdTaxWithoutBetaFlag:
      assertEnv(
        'NEXT_PUBLIC_FEATURE_TOGGLE_EID_TAX_WITHOUT_BETA_FLAG',
        process.env.NEXT_PUBLIC_FEATURE_TOGGLE_EID_TAX_WITHOUT_BETA_FLAG,
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
