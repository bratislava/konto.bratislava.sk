import { environment } from 'environment'
import { NextPageContext } from 'next'
import Cookies, { CookieSetOptions } from 'universal-cookie'

type Store = Record<string, string>

const isBrowser = typeof window !== 'undefined'

type Context = Pick<NextPageContext, 'req'>

const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000

const CUSTOM_COOKIE_TOKEN_TYPES = new Set(['accessToken', 'refreshToken'])

const getCookieKey = (key: string) => {
  const tokenType = key.split('.').pop() ?? ''

  return CUSTOM_COOKIE_TOKEN_TYPES.has(tokenType) ? tokenType : key
}

export class UniversalStorage implements Storage {
  cookies = new Cookies()

  store: Store = isBrowser ? window.localStorage : Object.create(null)

  constructor(context: Context = {}) {
    this.cookies = context.req ? new Cookies(context.req.headers.cookie as string) : new Cookies()

    Object.assign(this.store, this.cookies.getAll())
  }

  get length() {
    return Object.entries(this.store).length
  }

  clear() {
    Array.from(Array.from({ length: this.length }), (_, i) => this.key(i)).forEach((key) =>
      this.removeItem(key),
    )
  }

  getItem(key: keyof Store) {
    const keyName = getCookieKey(key)

    return this.getLocalItem(keyName) || this.getUniversalItem(keyName) || null
  }

  protected getLocalItem(key: keyof Store) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }

  protected getUniversalItem(key: keyof Store) {
    return this.cookies.get(key) as string | undefined
  }

  key(index: number) {
    return Object.keys(this.store)[index]
  }

  removeItem(key: string) {
    const keyName = getCookieKey(key)

    this.removeLocalItem(keyName)
    this.removeUniversalItem(keyName)
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
    const keyName = getCookieKey(key)

    this.setLocalItem(keyName, value)

    // keys take the shape:
    //  1. `${ProviderPrefix}.${userPoolClientId}.${username}.${tokenType}
    //  2. `${ProviderPrefix}.${userPoolClientId}.LastAuthUser
    const tokenType = key.split('.').pop() ?? ''

    // all cookies
    const sessionTokenTypes = ['LastAuthUser', 'accessToken', 'refreshToken', 'idToken']

    // cookies related to konto
    const localDomainTokenTypes = new Set(['LastAuthUser', 'idToken'])

    if (sessionTokenTypes.includes(tokenType)) {
      this.setUniversalItem(keyName, value, {
        expires: new Date(Date.now() + ONE_YEAR_IN_MS),
        domain: localDomainTokenTypes.has(tokenType)
          ? undefined
          : environment.cognitoCookieStorageDomain,
      })
    }
  }

  protected setLocalItem(key: keyof Store, value: string) {
    this.store[key] = value
  }

  protected setUniversalItem(key: keyof Store, value: string, options: CookieSetOptions = {}) {
    this.cookies.set(key, value, {
      // Allow unsecure requests to http://localhost:3000/ when in development.
      secure: environment.cognitoCookieStorageDomain !== 'localhost',
      ...options,
      path: '/',
      sameSite: true,
    })
  }
}
