/// <reference types="cypress" />

describe('A05 -', { testIsolation: false }, () => {
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

        it('2. Checking alert container.', () => {
          if (device === 'desktop') {
            cy.get('[data-cy=account-button]').click()
          } else {
            cy.get('[data-cy=mobile-account-button]').click()
          }
          cy.get('[data-cy=moj-profil-menu-item]').click()
          cy.get('[data-cy=alert-container]').should('be.visible')
          cy.get('[data-cy=alert-container]')
            .find('[data-cy="alert-container-title"]')
            .should('contain', 'Neoverený profil')
          cy.get('[data-cy=alert-container]')
            .find('[data-cy="alert-container-content"]')
            .should(
              'contain',
              'Vaša identita zatiaľ nebola overená voči štátnym registrom. Bratislavské konto môžete preto používať len v obmedzenom režime, bez možnosti odoslať elektronicky všetky žiadosti či využiť službu online platby dane z nehnuteľností.',
            )
          cy.get('[data-cy=alert-container-button]').click()
        })

        it('3. Validating redirect.', () => {
          cy.location('pathname', { timeout: 4000 }).should('eq', '/overenie-identity')
          cy.logOutUser()
        })
      })
    })
})
