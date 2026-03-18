/// <reference types="cypress" />

describe('A03 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  before(() => {
    cy.fixture('account.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.expose('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.expose('resolution')[`${device}`], () => {
        it('1. Logging in.', () => {
          cy.logInUser(device, this.fileData.email, this.fileData.password)
        })

        it('2. Toggling consent.', () => {
          if (device === 'desktop') {
            cy.get('[data-cy=account-button]').click()
          } else {
            cy.get('[data-cy=mobile-account-button]').click()
          }
          cy.get('[data-cy=moj-profil-menu-item]').click()
          cy.intercept('POST', '**/user/subscribe').as('subscribeUser')
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .click()
          cy.wait('@subscribeUser').its('response.statusCode').should('eq', 200)
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle] input')
            .should('be.checked')
        })

        it('3. Validate toggle state.', () => {
          cy.reload()
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle] input')
            .should('be.checked')
          cy.intercept('POST', '**/user/unsubscribe').as('unsubscribeUser')
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .click()
          cy.wait('@unsubscribeUser').its('response.statusCode').should('eq', 200)
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle] input')
            .should('not.be.checked')
          cy.logOutUser()
        })
      })
    })
})
