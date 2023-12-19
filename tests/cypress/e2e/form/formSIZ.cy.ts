/// <reference types="cypress" />

describe('F01 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  before(() => {
    cy.fixture('formSIZ.json').then((fileData) => {
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
          cy.hideNavbar(device)
        })

        // TODO add data-cy to form inputs
        
        it('1. Checking "File" step validation.', () => {
          cy.dataCy('close-modal').click()
          cy.dataCy('form-container').should('be.visible').matchImage()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            cy.dataCy('error-message').should('be.visible').should('have.class', 'text-error')
          })
        })

        it('2. Uploading file in "File" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=file-input]', form)).attachFile('../files/test.pdf');
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('3. Checking "Applicant" step validation.', () => {
          cy.dataCy('form-container').should('be.visible').matchImage()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 7)

            // TODO cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-negative-700')
          })
        })

        it('4. Filling out the "Applicant" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-value-0]', form)).should('be.visible')

            cy.wrap(Cypress.$('input[type=text]', form).first()).type(this.fileData.name)

            cy.wrap(Cypress.$('input[type=text]', form).eq(1)).type(this.fileData.address)

            cy.wrap(Cypress.$('input[type=text]', form).eq(2)).type(this.fileData.city)

            cy.wrap(Cypress.$('input[type=text]', form).eq(3)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('input[type=email]', form)).type(emailHash)

            cy.wrap(Cypress.$('input[type=tel]', form)).type(this.fileData.phone_number)

            //cy.wrap(Cypress.$('[data-cy=input-given_name]', form)).type(this.fileData.given_name)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click() // ???
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('5. Filling out the "Investor" step', () => {
          cy.dataCy('form-container').should('be.visible').matchImage()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[data-cy=radio-value-0]', form)).should('be.visible')

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 1)        

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('6. Checking "Responsible designer" step validation.', () => {
          cy.dataCy('form-container').should('be.visible').matchImage()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 4)
            cy.wrap(Cypress.$('[data-cy=error-message]', form)).should('have.length', 5)

            // TODO cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-negative-700')
          })
        })

        it('7. Filling out the "Responsible designer" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('input[type=text]', form).first()).type(this.fileData.name)

            cy.wrap(Cypress.$('input[type=email]', form)).type(emailHash)

            cy.wrap(Cypress.$('input[type=tel]', form)).type(this.fileData.phone_number)

            cy.wrap(Cypress.$('input[type=text]', form).eq(1)).type(this.fileData.authorization_certificate_number)

            cy.wrap(Cypress.$('div[role=spinbutton] span', form).eq(0)).type(this.fileData.day)
            cy.wrap(Cypress.$('div[role=spinbutton] span', form).eq(1)).type(this.fileData.month)
            cy.wrap(Cypress.$('div[role=spinbutton] span', form).eq(2)).type(this.fileData.year)

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('6. Checking "Construction information" step validation.', () => {
          cy.dataCy('form-container').should('be.visible').matchImage()
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 5)
            cy.wrap(Cypress.$('[data-cy=error-message]', form)).should('have.length', 4)

            // TODO cy.wrap(Cypress.$(errorBorderFields, form)).should('have.class', 'border-negative-700')
          })
        })

        it('8. Filling out the "Construction information" step.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('input[type=text]', form).first()).type(this.fileData.construction_name)

            cy.wrap(Cypress.$('[data-cy=radio-value-0]', form)).should('be.visible')

            cy.wrap(Cypress.$('input[type=text]', form).eq(1)).type(this.fileData.address)

            cy.wrap(Cypress.$('input[type=text]', form).eq(2)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('input[type=text]', form).eq(3)).type(this.fileData.zip_code)

            cy.wrap(Cypress.$('input[type=text][role=combobox]', form).first()).type("Devín")
          })
          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$('[role=option]', form).first()).click()
            cy.wrap(Cypress.$('[data-cy=dropdown-close]', form)).click()

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('9. Checking form summary page.', () => {
          cy.dataCy('form-container').should('be.visible').matchImage()

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$("[data-cy=alert-container]", form)).should('not.exist')
          })
        })
      })
    })
})
