/// <reference types="cypress" />

describe('RF02 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const errorBorderFields = '[data-cy=input-email], [data-cy=input-name], [data-cy=input-password]'
  const password = `P@9${Date.now().toString(36)}`

  before(() => {
    cy.fixture('registrationPO.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
        const emailHash = `${Date.now() + device}@cypress.test`

        it('1. Submitting a empty registration PO form.', () => {
          cy.visit('/registracia')
          cy.hideNavbar(device)
        })

        it('2. Check validation.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-právnická-osoba]', form)).check()
            cy.wrap(Cypress.$('[data-cy=radio-právnická-osoba]', form)).should('be.checked')

            cy.wrap(Cypress.$('button[type=submit]', form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 4)

            cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-negative-700')
          })
          cy.dataCy('registration-container').should('be.visible') //.matchImage({maxDiffThreshold: 0.17})
        })

        it('3. Filling out the registration form.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(emailHash)

            cy.wrap(Cypress.$('[data-cy=input-name]', form)).type(this.fileData.company_name)

            cy.wrap(Cypress.$('[data-cy=input-password]', form)).type(password)
          })
        })

        it('4. Check that required inputs are not in error state.', () => {
          cy.checkFormFieldsNotInErrorState('register-form', errorBorderFields)
        })

        it('5. Submitting the form and checking the redirection to 2FA.', () => {
          cy.submitForm('register-form')
        })

        it('6. Check the 2FA page.', () => {
          cy.check2FAPage(emailHash)
        })

        it('8. Logout user.', () => {
          cy.logOutUser()
        })
      })
    })
})
