import { AuthError } from 'aws-amplify/auth'
import { getCurrentUser } from 'aws-amplify/auth/server'
import jwt from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
import { GetServerSidePropsContext } from 'next/types'

import { environment } from '../../environment'
import { AmplifyServerContextSpec } from './amplifyTypes'
import { isProductionDeployment } from './general'

const jwks = isProductionDeployment()
  ? // https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_GCBQzfACy/.well-known/jwks.json
    [
      {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'n5b7z6qPlgc1NoMqNxMhp8PjasljQBSbxFsIV54glqo=',
        kty: 'RSA',
        n: 'xsGlwbh8y8yTxCIuuehQ3bhm0fwRvOGiRQsEdrLViX64G-jZH5Qrr9QWj6SjpFhOLK8ERircurqjd6D6EyJC3nWVsfP_8sJyAX1VqCYymmZuMS2BHLkfYBLGb7wNPPP4x4GZjJNldnwdKgRZn4RTszhaelr-VsXOoT_-hlPPdImcFPSvjIZ9qnBNwpJ5h35wjKdr6rMj9S-FciASlJdudErNdO4eft02WjnBNoMBK4lyNHLYBwKs0Zfd9A2sZlCq5VZiw5PdTHh7UOgnU-HUEwnEtFonWXOv3WfO1S_DBI56iybqANr40xWwfx3c_N-_bPR_Gxm_kv7QOLJsFXcJCQ',
        use: 'sig',
      },
      {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'zSsi46R/Jy+dDeqf+DiNGEdhco9C3r0w3HlFvl4biVs=',
        kty: 'RSA',
        n: '1MtRPlesYkwwseNg31YkdLQzvUd7x3vsspcKI6Phu9aSM63rb3eUXrh93vSebkMDgz9zfzt_02UsfvUJwTXQlDj0QoIfUowsIwC8jUpdJ-TVzWz72iVehn7fB07uQk9tkMtI2JRpYFXb2FWQGhfszoFnso5gR4Oc2IbwRZ120ENHF4NUWEbkomXqbAwnlJ_jaMcyn3orWXWLt9NoBLaTfPCfLVtwxhM1OtaqhGRt5sKjxOAgzfagZKheRFb1YyGStMD4UailWawDQ4pItOH6re3OZ-18G9JFjkyruyNLN_9uQV30zjtcKoKBOrM_sO08XeMtYiGQzHl-l6IrBYrTaQ',
        use: 'sig',
      },
    ]
  : // https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_FZDV0j2ZK/.well-known/jwks.json
    [
      {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'gJeBEC90UWmch7DjJV6aUgNAkhe/LM9yfYQHHbzktJM=',
        kty: 'RSA',
        n: 'rmBcifNOIFpUZz0A4eGzEJ9Y-ccR42BZcGE1TgsHUT_6EwyoPJK-n_aH9daMU7N43L5Q6-7evUKjs56UKiJeHk2rfWYyCBxXWN4Qq20zRYaz2YACc8nIFXevE7b_kEQjsiR8ktjQJrdQ1H2M_tWb-Lt63RNADPY0ipn9CfvZcoykT1vavkJ4d28DkM_a1lD4-Gd9Ba1OqFKLgNOlc45Ttw29jlVANf9z8zzKZF3-nEmDkTieQdXtqW8p3QmePXfn93McqFDBge9JwkeoiE1mf5o_mBav-ChL0EDZhAGQSBLXZTXR2TmaRHcMo4q3Dr4vJ5UP9rNwow3LGpu03n4lQQ',
        use: 'sig',
      },
      {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'u2rqn/IHBiypr5sQ23T0wCNY3xiitUfGAmlgwpXlSHk=',
        kty: 'RSA',
        n: 'uWHAuzatCQuMTUwYTS_5izkcs7Q9GGH-V77GLoPPLOh-ltt2NO7nMM5zI0-FGWZeTVdMbMpAcFH20gH44vaFvlnAnNP3EFBj7URB_vk3_nTQaF0sZ20YZYQwQUImSSVH0IT1MlhYyX6EdrDDN2FEB2MeMoI2Iv8y0R3TDfa3OLEeg342j7_wj16wc4VCV60Cji6nfd-IkxgfqwWc4asqD6cjj8ZgiF6-5zy4Idu9RSZTwU8ulzMD5sXVOleabkruQQJFX_v_u58UPENNKFT7kKRqo1ylXauf-x_C3wk35yC1qH1MOq7H-t5Zn24zlfMsUe-idSZrJ0k2Fz7gBaZ8PQ',
        use: 'sig',
      },
    ]

const getUserId = async (contextSpec: AmplifyServerContextSpec) => {
  try {
    const { userId } = await getCurrentUser(contextSpec)
    return userId
  } catch (error) {
    if (error instanceof AuthError && error.name === 'UserUnAuthenticatedException') {
      return null
    }
    throw error
  }
}

const assertIdTokenCookie = (userId: string, idToken: string) => {
  const decoded = jwt.decode(idToken, { complete: true })
  if (!decoded || !decoded.header.kid) {
    throw new Error('Invalid token')
  }

  const jwk = jwks.find((jwkInner) => jwkInner.kid === decoded.header.kid)
  if (!jwk) {
    throw new Error('JWK not found for kid')
  }

  const pem = jwkToPem(jwk as jwkToPem.JWK)

  const options = {
    issuer: `https://cognito-idp.${environment.awsRegion}.amazonaws.com/${environment.cognitoUserPoolId}`,
    audience: environment.cognitoClientId,
    ignoreExpiration: true,
  }

  const verified = jwt.verify(idToken, pem, options)
  if (!verified) {
    throw new Error('Token verification failed')
  }

  const payloadUserName = decoded.payload['cognito:username']
  if (payloadUserName !== userId) {
    throw new Error(`Token does not match user, expected ${userId} but got ${payloadUserName}`)
  }
}

export const assertContextSpecAndIdToken = async (
  context: GetServerSidePropsContext,
  contextSpec: AmplifyServerContextSpec,
) => {
  const userId = await getUserId(contextSpec)
  // The request is not authenticated
  if (!userId) {
    return
  }

  const cookieEntries = Object.entries(context.req.cookies) as [string, string][]
  const idTokenCookie = cookieEntries.find(([key]) =>
    /^CognitoIdentityServiceProvider\..+?\.idToken$/.test(key),
  )
  if (!idTokenCookie) {
    throw new Error('Expected idTokenCookie cookie not found')
  }

  const cookieValue = idTokenCookie[1]

  assertIdTokenCookie(userId, cookieValue)
}
