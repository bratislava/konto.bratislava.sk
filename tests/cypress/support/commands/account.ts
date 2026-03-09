/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in user.
     * @param device device.
     * @param email account email.
     * @param password account password.
     * @example cy.logInUser('mobile', 'test@cypress.test', 'password')
     */
    logInUser(device: string, email: string, password: string): Chainable<any>

    /**
     * Custom command to log out user.
     * @example cy.logOutUser()
     */
    logOutUser(): Chainable<any>

  }
}

Cypress.Commands.add('logInUser', (device, email, password) => {
  cy.visit('/prihlasenie')
  cy.waitForHydration()
  cy.location('pathname', { timeout: 20000 }).should('eq', '/prihlasenie')
  cy.dataCy('login-container').then((form) => {
    cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(email)
    cy.wrap(Cypress.$('[data-cy=input-password]', form)).type(password)
    cy.wrap(Cypress.$('[data-cy=login-button]', form)).click()
  })
  cy.location('pathname', { timeout: 20000 }).should('eq', '/')
})

Cypress.Commands.add('logOutUser', () => {
  cy.visit('/odhlasenie')
  cy.waitForHydration()
  cy.get('[data-cy=odhlásiť-sa-button]').click()
  cy.location('pathname', { timeout: 4000 }).should('eq', '/prihlasenie')
})

