import { environment } from 'environment'
import { NextPageContext } from 'next'
import Cookies, { CookieSetOptions } from 'universal-cookie'

type Store = Record<string, string>

const isBrowser = typeof window !== 'undefined'

type Context = Pick<NextPageContext, 'req'>

const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000

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
    return this.getLocalItem(key) || this.getUniversalItem(key) || null
  }

  protected getLocalItem(key: keyof Store) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }

  protected getUniversalItem(key: keyof Store) {
    const cookieTokenTypes = new Set(['accessToken', 'refreshToken'])

    const tokenType = key.split('.').pop() ?? ''

    return this.cookies.get(cookieTokenTypes.has(tokenType) ? tokenType : key) as string | undefined
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
    const tokenType = key.split('.').pop() ?? ''

    // all cookies
    const sessionTokenTypes = ['LastAuthUser', 'accessToken', 'refreshToken', 'idToken']

    // cookies related to konto
    const localDomainTokenTypes = new Set(['LastAuthUser', 'idToken'])

    if (sessionTokenTypes.includes(tokenType)) {
      this.setUniversalItem(localDomainTokenTypes.has(tokenType) ? key : tokenType, value, {
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
