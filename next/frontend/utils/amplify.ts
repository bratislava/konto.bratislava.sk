/* eslint-disable import/no-extraneous-dependencies */
// @aws-amplify/auth & @aws-amplify/core are part of aws-amplify & safe enough to import here like this
// this import fixes issues with Jest not being able to parse esm lib imported in the root of aws-amplify
import { AmplifyClass, Credentials } from '@aws-amplify/core';
import { DataStore } from '@aws-amplify/datastore';
import { Amplify, API, Auth } from 'aws-amplify'
import { environment } from 'environment'
import { ROUTES } from 'frontend/api/constants'
import { NextPageContext } from 'next';

import logger from './logger'
import { UniversalStorage } from './universalStorage'

// TODO once env handling is merged update not to use process.env directly
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
    storage: new UniversalStorage(),
  },
  ssr: true,
})

// if anything happens when getting the token, does nothing - may swallow errors
export const getAccessToken = async () => {
  try {
    const session = await Auth.currentSession()
    return session.getAccessToken().getJwtToken()
  } catch (error) {
    if (error === 'The user is not authenticated' || error === 'No current user') {
      // expected case, user is not authenticated
      return null
    }
    throw error
  }
}

export const getAccessTokenOrLogout = async () => {
  try {
    const session = await Auth.currentSession()
    const jwtToken = session.getAccessToken().getJwtToken()
    if (!jwtToken) throw new Error('no jwt token found in current session')
    return jwtToken
  } catch (error) {
    logger.error('error getting access token - redirect to login', error)
    window.location.assign(ROUTES.LOGIN)
    throw error
  }
}

// Auth.getCurrentAuthenticatedUser throws when not authenticated
// this helper changes that and ignores any other potential errors
export const getCurrentAuthenticatedUser = async () => {
  try {
    // TODO should be solved in v6 release of aws-amplify
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await Auth.currentAuthenticatedUser()
  } catch (error) {
    return null
  }
}

const requiredModules = [
	// API cannot function without Auth
	Auth,
	// Auth cannot function without Credentials
	Credentials,
];

// These modules have been tested with SSR
const defaultModules = [API, Auth, DataStore];



interface Context extends Pick<NextPageContext, 'req' > {
  modules?: any[];
}


export function withSSRContext(context: Context = {}) {
	const { modules = defaultModules, req } = context;
	const previousConfig = Amplify.configure();
	const amplify = new AmplifyClass();
	const storage = new UniversalStorage({ req });

	requiredModules.forEach(m => {
		if (!modules.includes(m)) {
			// @ts-ignore This expression is not constructable.
			// Type 'Function' has no construct signatures.ts(2351)
			amplify.register(new m.constructor());
		}
	});

	// Associate new module instances with this amplify
	modules.forEach(m => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		amplify.register(new m.constructor());
	});

	// Configure new Amplify instances with previous configuration
	amplify.configure({ ...previousConfig, storage });

	return amplify;
}