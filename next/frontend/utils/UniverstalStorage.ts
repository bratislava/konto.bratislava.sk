// copied and edited from https://github.com/aws-amplify/amplify-js/blob/4c9bcb492ffa4d528f1590dd797262ae0b8317ea/packages/core/src/UniversalStorage/index.ts

import Cookies, { CookieSetOptions } from 'universal-cookie'

import { isBrowser } from './general'

type Store = Record<string, string>

type Context = { req?: any }

const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000

export class UniversalStorage implements Storage {
  cookies = new Cookies()

  store: Store = isBrowser() ? window.localStorage : Object.create(null)

  constructor(context: Context = {}) {
    this.cookies = context.req ? new Cookies(context.req.headers.cookie) : new Cookies()

    Object.assign(this.store, this.cookies.getAll())
  }

  get length() {
    return Object.entries(this.store).length
  }

  clear() {
    Array.from(new Array(this.length))
      .map((_, i) => this.key(i))
      .forEach((key) => this.removeItem(key))
  }

  getItem(key: keyof Store) {
    return this.getLocalItem(key)
  }

  protected getLocalItem(key: keyof Store) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }

  protected getUniversalItem(key: keyof Store) {
    return this.cookies.get(key)
  }

  key(index: number) {
    return Object.keys(this.store)[index]
  }

  removeItem(key: string) {
    this.removeLocalItem(key)
    this.removeUniversalItem(key)
  }

  protected removeLocalItem(key: keyof Store) {
    delete this.store[key]
  }

  protected removeUniversalItem(key: keyof Store) {
    this.cookies.remove(key, {
      path: '/',
    })
  }

  setItem(key: keyof Store, value: string) {
    this.setLocalItem(key, value)

    // keys take the shape:
    //  1. `${ProviderPrefix}.${userPoolClientId}.${username}.${tokenType}
    //  2. `${ProviderPrefix}.${userPoolClientId}.LastAuthUser
    const tokenType = key.split('.').pop()

    const sessionTokenTypes = [
      'LastAuthUser',
      'accessToken',
      // refreshToken originates on the client, but SSR pages won't fail when this expires
      // Note: the new `accessToken` will also be refreshed on the client (since Amplify doesn't set server-side cookies)
      'refreshToken',
      // Required for CognitoUserSession - idToken contains all of the custom data as well, so this may cause the cookie to get too large
      // 'idToken',
      // userData is used when `Auth.currentAuthenticatedUser({ bypassCache: false })`.
      // Can be persisted to speed up calls to `Auth.currentAuthenticatedUser()`
      // 'userData',

      // Ignoring clockDrift on the server for now, but needs testing
      // 'clockDrift',
    ]
    if (sessionTokenTypes.includes(tokenType ?? '')) {
      this.setUniversalItem(key, value, {
        expires: new Date(Date.now() + ONE_YEAR_IN_MS),
      })
    }
  }

  protected setLocalItem(key: keyof Store, value: string) {
    this.store[key] = value
  }

  protected setUniversalItem(key: keyof Store, value: string, options: CookieSetOptions = {}) {
    this.cookies.set(key, value, {
      ...options,
      path: '/',
      sameSite: true,
      secure: isBrowser() && window.location.hostname === 'localhost',
      domain: 'bratislava.sk',
    })
  }
}
