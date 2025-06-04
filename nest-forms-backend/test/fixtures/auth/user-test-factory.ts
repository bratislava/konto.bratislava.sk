import { Provider } from '@nestjs/common'
import { TestingModuleBuilder } from '@nestjs/testing'

import { createMockAuthProviders } from '../../mocks/auth/mock-auth-providers'
import { AuthFixtureUser, GuestFixtureUser, UserFixtureFactory } from './user'

export class UserTestFactory {
  private authUsers: AuthFixtureUser[] = []

  private guestUsers: GuestFixtureUser[] = []

  private userFactory = new UserFixtureFactory()

  // Create multiple auth users at once
  createAuthUsers(
    count: number,
    options?: Parameters<UserFixtureFactory['createAuthUser']>[0][],
  ): AuthFixtureUser[] {
    const users = Array.from({ length: count }, (_, index) => {
      const userOptions = options?.[index] || {}
      return this.userFactory.createAuthUser(userOptions)
    })

    this.authUsers.push(...users)
    return users
  }

  // Create multiple guest users at once
  createGuestUsers(count: number): GuestFixtureUser[] {
    const users = Array.from({ length: count }, () =>
      this.userFactory.createGuestUser(),
    )
    this.guestUsers.push(...users)
    return users
  }

  // Create a single auth user
  createAuthUser(
    options?: Parameters<UserFixtureFactory['createAuthUser']>[0],
  ): AuthFixtureUser {
    const user = this.userFactory.createAuthUser(options)
    this.authUsers.push(user)
    return user
  }

  // Create a single guest user
  createGuestUser(): GuestFixtureUser {
    const user = this.userFactory.createGuestUser()
    this.guestUsers.push(user)
    return user
  }

  // Convenience method for mixed user creation
  createUsers(config: {
    authUsers?: number | Parameters<UserFixtureFactory['createAuthUser']>[0][]
    guestUsers?: number
  }): {
    authUsers: AuthFixtureUser[]
    guestUsers: GuestFixtureUser[]
    allUsers: (AuthFixtureUser | GuestFixtureUser)[]
  } {
    const authUsers = Array.isArray(config.authUsers)
      ? this.createAuthUsers(config.authUsers.length, config.authUsers)
      : this.createAuthUsers(config.authUsers || 0)

    const guestUsers = this.createGuestUsers(config.guestUsers || 0)

    return {
      authUsers,
      guestUsers,
      allUsers: [...authUsers, ...guestUsers],
    }
  }

  // Get providers that know about all registered users
  getMockProviders(): Provider[] {
    return createMockAuthProviders(this.authUsers, this.guestUsers)
  }

  // Integration with TestingModuleBuilder
  setupMockAuth(module: TestingModuleBuilder): TestingModuleBuilder {
    const providers = this.getMockProviders()
    providers.forEach((provider) => {
      module.overrideProvider(provider.provide).useValue(provider.useValue)
    })
    return module
  }

  // Clear all registered users
  clear(): void {
    this.authUsers = []
    this.guestUsers = []
  }

  // Get all registered users (for debugging)
  getAllUsers(): {
    authUsers: AuthFixtureUser[]
    guestUsers: GuestFixtureUser[]
  } {
    return {
      authUsers: [...this.authUsers],
      guestUsers: [...this.guestUsers],
    }
  }
}
