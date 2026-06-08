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
          cy.intercept('POST', '**/user/gdpr-consent').as('grantConsent')
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .click()
          cy.wait('@grantConsent').then((interception) => {
            expect(interception.request.body).to.deep.include({ grant: true })
            expect(interception.response?.statusCode).to.eq(204)
          })
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle] input')
            .should('be.checked')
        })

        it('3. Validate toggle state.', () => {
          cy.reload()
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle] input')
            .should('be.checked')
          cy.intercept('POST', '**/user/gdpr-consent').as('revokeConsent')
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle]')
            .click()
          cy.wait('@revokeConsent').then((interception) => {
            expect(interception.request.body).to.deep.include({ grant: false })
            expect(interception.response?.statusCode).to.eq(204)
          })
          cy.get('[data-cy=receive-information-consent]')
            .find('[data-cy=receive-information-toggle] input')
            .should('not.be.checked')
          cy.logOutUser()
        })
      })
    })
})
