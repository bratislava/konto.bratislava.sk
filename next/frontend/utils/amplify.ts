/* eslint-disable import/no-extraneous-dependencies */
// @aws-amplify/core is part of aws-amplify & safe enough to import here like this - though the export is deprecated so we use it only here
// this import fixes issues with Jest not being able to parse esm lib imported in the root of aws-amplify
import Amplify from '@aws-amplify/core'
import { environment } from 'environment'

Amplify.configure({
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: environment.cognitoIdentityPoolId,

    // REQUIRED - Amazon Cognito Region
    region: environment.awsRegion,

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: environment.cognitoUserPoolId,

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: environment.cognitoClientId,

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
    // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
    signUpVerificationMethod: 'code',
  },
  ssr: true,
})
