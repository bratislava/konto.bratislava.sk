/// <reference types="cypress" />

describe('F04 -', { testIsolation: false }, () => {
  const devices = ['desktop']
  const errorBorderFields =
    '[data-cy=input-email], [data-cy=input-given_name], [data-cy=input-family_name], [data-cy=input-password]'
  const password = `P@9${Date.now().toString(36)}`

  before(() => {
    cy.fixture('formSummaryCheck.json').then((fileData) => {
      this.fileData = fileData
    })

    cy.fixture('registration.json').then((registrationData) => {
      this.registrationData = registrationData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {
        const emailHash = `${Date.now() + device}@cypress.test`

        before(() => {
          cy.visit('/mestske-sluzby/stanovisko-k-investicnemu-zameru')
        })

        beforeEach(() => {
          cy.hideNavbar(device)
        })

        it('1. Press fill form button.', () => {
          cy.dataCy('form-landing-page-fill-form-button').click()
        })

        it('2. Checking "Applicant" step validation.', () => {
          cy.dataCy('close-modal').click()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 8)
          })

          cy.dataCy('form-container').should('be.visible') //.matchImage()
        })

        it('3. Filling out the "Applicant" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-fyzická-osoba]', form)).should('be.checked')

            cy.wrap(Cypress.$('[data-cy=input-meno]', form)).type(this.fileData.first_name)

            cy.wrap(Cypress.$('[data-cy=input-priezvisko]', form)).type(this.fileData.last_name)

            cy.wrap(Cypress.$('[data-cy=input-ulicaACislo]', form)).type(this.fileData.address)

            cy.wrap(Cypress.$('[data-cy=input-mesto]', form)).type(this.fileData.city)

            cy.wrap(Cypress.$('[data-cy=input-psc]', form)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(this.fileData.email)

            cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).type(this.fileData.phone_number)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('4. Going to registration.', () => {
          cy.showNavbar(device)
          if (device === 'desktop') {
            cy.get('[data-cy=register-button]').click()
          } else {
            cy.get('[data-cy=mobile-account-button]').click()
            cy.url().should('include', '/prihlasenie')
            cy.get('[data-cy=registracia-button]').click()
          }

          cy.url().should('include', '/registracia')
          cy.dataCy('registration-container').should('be.visible') //.matchImage()
        })

        it('5. Filling out the registration form.', () => {
          cy.dataCy('register-form').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-fyzická-osoba]', form)).should('be.checked')

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(emailHash)

            cy.wrap(Cypress.$('[data-cy=input-given_name]', form)).type(
              this.registrationData.given_name,
            )

            cy.wrap(Cypress.$('[data-cy=input-family_name]', form)).type(
              this.registrationData.family_name,
            )

            cy.wrap(Cypress.$('[data-cy=input-password]', form)).type(password)
          })
        })

        it('6. Check that required inputs are not in error state.', () => {
          cy.checkFormFieldsNotInErrorState('register-form', errorBorderFields)
          cy.dataCy('registration-container').should('be.visible') //.matchImage()
          cy.wait(500)
          cy.submitForm('register-form')
        })

        it('7. Submitting the form and checking the redirection to original form.', () => {
          cy.check2FAPage(emailHash)
        })

        it('8. Logout user.', () => {
          cy.logOutUser()
        })
      })
    })
})
