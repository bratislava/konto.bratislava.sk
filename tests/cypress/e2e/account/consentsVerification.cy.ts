/// <reference types="cypress" />

describe('A03 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  before(() => {
    cy.fixture('account.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
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
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .click()
          cy.checkSuccessSnackbar()
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .find('.bg-success-700')
        })

        it('3. Validate toggle state.', () => {
          cy.reload()
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .find('.bg-success-700')
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .click()
          cy.checkSuccessSnackbar()
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .find('.bg-gray-400')
          cy.logOutUser()
        })
      })
    })
})
