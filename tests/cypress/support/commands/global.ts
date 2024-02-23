/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @param attribute data-cy name.
     * @param specify It is used to specify the search, for example pointing to a child.
     * @example cy.dataCy('greeting')
     */
    dataCy(attribute: string, specify?: string): Chainable<any>

    /**
     * Custom command to hide navbar on device.
     * @param device Device type.
     * @example cy.hideNavbar('desktop')
     */
    hideNavbar(device: string): Chainable<any>

    /**
     * Custom command to hide info bar on device.
     * @example cy.hideInfoBar()
     */
    hideInfoBar(): Chainable<any>

    /**
     * Custom command to show navbar on device.
     * @param device Device type.
     * @example cy.showNavbar('desktop')
     */
    showNavbar(device: string): Chainable<any>

    /**
     * Logout the user.
     * @example cy.logout()
     */
    logout(): Chainable<any>
  }
}

Cypress.Commands.add('dataCy', (attribute, specify) => {
  const selector = `[data-cy=${attribute}]${specify ? specify : ''}`
  cy.get(selector)
})

Cypress.Commands.add('hideNavbar', (device) => {
  cy.get(`#${device}-navbar`).invoke('attr', 'style', 'display: none')
})

Cypress.Commands.add('hideInfoBar', () => {
  if (cy.dataCy(`info-bar`)) {
    cy.dataCy(`info-bar`).invoke('attr', 'style', 'display: none')
  }
})

Cypress.Commands.add('showNavbar', (device) => {
  cy.get(`#${device}-navbar`).invoke('attr', 'style', '')
})

Cypress.Commands.add('logout', () => {
  cy.visit("/logout")
  cy.dataCy("cancel-button")
})
