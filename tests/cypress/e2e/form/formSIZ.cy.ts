/// <reference types="cypress" />

describe('F01 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const applicantErrorBorderFields =
    '[data-cy=input-menoPriezvisko], [data-cy=input-ulicaACislo], [data-cy=input-mesto], [data-cy=input-psc], [data-cy=input-email], [data-cy=input-telefon]'
  const designerErrorBorderFields =
    '[data-cy=input-menoPriezvisko], [data-cy=input-email], [data-cy=input-projektantTelefon], [data-cy=input-autorizacneOsvedcenie]'
  const constructionErrorBorderFields =
    '[data-cy=input-nazov], [data-cy=input-ulica], [data-cy=input-parcelneCislo]'

  before(() => {
    cy.fixture('form.json').then((fileData) => {
      this.fileData = fileData
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
            cy.checkFormValidation(device, form, 7, applicantErrorBorderFields)
          })

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).type(
              this.fileData.phone_number_wrong,
            )
            cy.checkFormValidation(device, form, 7, applicantErrorBorderFields)
          })

          cy.dataCy('form-container').should('be.visible') //.matchImage()
        })

        it('3. Filling out the "Applicant" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-fyzická-osoba]', form)).should('be.checked')

            cy.wrap(Cypress.$('[data-cy=input-menoPriezvisko]', form)).type(
              `${this.fileData.first_name} ${this.fileData.last_name}`,
            )

            cy.wrap(Cypress.$('[data-cy=input-ulicaACislo]', form)).type(this.fileData.address)

            cy.wrap(Cypress.$('[data-cy=input-mesto]', form)).type(this.fileData.city)

            cy.wrap(Cypress.$('[data-cy=input-psc]', form)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(emailHash)

            cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).focus().clear()
            cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).type(this.fileData.phone_number)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('4. Filling out the "Stavebník" step', () => {
          cy.dataCy('form-container').should('be.visible') //.matchImage()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).should('be.checked')

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 1)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('5. Checking "Responsible designer" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 4)
            cy.wrap(Cypress.$('[data-cy=error-message]', form)).should('have.length', 5)

            cy.wrap(Cypress.$(designerErrorBorderFields, form)).should(
              'have.class',
              'border-negative-700',
            )
          })

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-projektantTelefon]', form)).type(
              this.fileData.phone_number_wrong,
            )

            cy.checkFormValidation(device, form, 4, designerErrorBorderFields)
          })
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=error-message]', form)).should('have.length', 5)
          })

          cy.dataCy('form-container').should('be.visible') //.matchImage()
        })

        it('6. Filling out the "Responsible designer" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-menoPriezvisko]', form)).type(
              `${this.fileData.first_name} ${this.fileData.last_name}`,
            )

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(emailHash)

            cy.wrap(Cypress.$('[data-cy=input-projektantTelefon]', form)).focus().clear()
            cy.wrap(Cypress.$('[data-cy=input-projektantTelefon]', form)).type(
              this.fileData.phone_number,
            )
            cy.wrap(Cypress.$('[data-cy=input-projektantTelefon]', form))
              .invoke('val')
              .should('match', /\+421[0-9]{9}/g)

            cy.wrap(Cypress.$('[data-cy=input-autorizacneOsvedcenie]', form)).type(
              this.fileData.authorization_certificate_number,
            )

            cy.wrap(Cypress.$('[data-cy=date-time-day]', form)).type(this.fileData.day)
            cy.wrap(Cypress.$('[data-cy=date-time-month]', form)).type(this.fileData.month)
            cy.wrap(Cypress.$('[data-cy=date-time-year]', form)).type(this.fileData.year)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('7. Checking "Construction information" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 5)
            cy.wrap(Cypress.$('[data-cy=error-message]', form)).should('have.length', 4)

            cy.wrap(Cypress.$(constructionErrorBorderFields, form)).should(
              'have.class',
              'border-negative-700',
            )
          })
          cy.dataCy('form-container').should('be.visible') //.matchImage()
        })

        it('8. Filling out the "Construction information" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=input-nazov]', form)).type(this.fileData.construction_name)

            cy.wrap(Cypress.$('[data-cy=radio-bytový-dom]', form)).should('be.checked')

            cy.wrap(Cypress.$('[data-cy=input-ulica]', form)).type(this.fileData.address)

            cy.wrap(Cypress.$('[data-cy=input-supisneCislo]', form)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('[data-cy=input-parcelneCislo]', form)).type(this.fileData.zip_code)
            cy.selectFromDropdown(form, 'select-katastrálne-územie', this.fileData.kataster)
          })
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[role=option]', form).eq(0)).click()
            cy.wrap(Cypress.$('[data-cy=dropdown-close]', form)).click()

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('9. Checking "File" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            cy.dataCy('error-message').should('be.visible').should('have.class', 'text-error')
          })
          cy.dataCy('form-container').should('be.visible') //.matchImage()
        })

        it('10. Uploading file in "File" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=file-input]', form)).attachFile('../files/test.pdf')
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('11. Checking form summary page.', () => {
          cy.dataCy('form-container').should('be.visible') //.matchImage()

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=alert-container].bg-negative-100`, form)).should(
              'not.exist',
            )
          })
        })
      })
    })
})
