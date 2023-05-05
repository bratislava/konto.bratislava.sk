import { CognitoUserAttribute, UserData } from 'amazon-cognito-identity-js'
import { Amplify, Auth } from 'aws-amplify'
import { Address } from 'aws-sdk/clients/ec2'
import { cognitoCustomAttributes, cognitoUpdatableAttributes, Tier } from 'frontend/dtos/cognitoDto'

// TODO validate and scream into logs when env variables are missing

console.log('going to configure ')

// Amplify.configure({
//   Auth: {
//     // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
//     identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,

//     // REQUIRED - Amazon Cognito Region
//     region: process.env.NEXT_PUBLIC_AWS_REGION,

//     // OPTIONAL - Amazon Cognito Federated Identity Pool Region
//     // Required only if it's different from Amazon Cognito Region
//     // identityPoolRegion: 'XX-XXXX-X',

//     // OPTIONAL - Amazon Cognito User Pool ID
//     userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,

//     // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
//     userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,

//     // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
//     mandatorySignIn: true,

//     // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
//     // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
//     signUpVerificationMethod: 'code', // 'code' | 'link'

//     // OPTIONAL - Configuration for cookie storage
//     // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
//     // cookieStorage: {
//     //   // REQUIRED - Cookie domain (only required if cookieStorage is provided)
//     //   domain: '.yourdomain.com',
//     //   // OPTIONAL - Cookie path
//     //   path: '/',
//     //   // OPTIONAL - Cookie expiration in days
//     //   expires: 365,
//     //   // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
//     //   sameSite: 'strict' | 'lax',
//     //   // OPTIONAL - Cookie secure flag
//     //   // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
//     //   secure: true,
//     // },

//     // OPTIONAL - customized storage object
//     // storage: MyStorage,

//     // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
//     // authenticationFlowType: 'USER_PASSWORD_AUTH',

//     // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
//     // clientMetadata: {myCustomKey: 'myCustomValue'},

//     // OPTIONAL - Hosted UI configuration
//     // oauth: {
//     //   domain: 'your_cognito_domain',
//     //   scope: [
//     //     'phone',
//     //     'email',
//     //     'profile',
//     //     'openid',
//     //     'aws.cognito.signin.user.admin',
//     //   ],
//     //   redirectSignIn: 'http://localhost:3000/',
//     //   redirectSignOut: 'http://localhost:3000/',
//     //   responseType: 'code', // or 'token', note that REFRESH token will only be generated when the responseType is code
//     // },
//   },
// })

console.log('config done')
console.log(Amplify)

export const objectToUserAttributes = (data: UserData | Address): CognitoUserAttribute[] => {
  const attributeList: CognitoUserAttribute[] = []
  Object.entries(data).forEach(([key, value]: [string, string | Tier | Address]) => {
    if (cognitoUpdatableAttributes.has(key)) {
      const attribute = new CognitoUserAttribute({
        Name: cognitoCustomAttributes.has(key) ? `custom:${key}` : key,
        Value:
          key === 'address'
            ? JSON.stringify(value)
            : key === 'phone_number'
            ? typeof value === 'string' && value?.replace(' ', '')
            : JSON.stringify(value),
      })
      attributeList.push(attribute)
    }
  })
  return attributeList
}

export const userAttributesToObject = (attributes?: CognitoUserAttribute[]): UserData => {
  const data: UserData = {}
  attributes?.forEach((attribute: CognitoUserAttribute) => {
    const attributeKey: string = attribute.getName().replace(/^custom:/, '')
    data[attributeKey] =
      attributeKey === 'address' ? JSON.parse(attribute.getValue()) : attribute.getValue()
  })
  return data
}
