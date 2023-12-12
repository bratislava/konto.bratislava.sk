/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to check if all form inputs are not in error state.
     * @param form Form name.
     * @param errorBorderFields All fields to check.
     * @example cy.checkFormFieldsNotInErrorStateCy('register-form')
     */
    checkFormFieldsNotInErrorStateCy(form: string, errorBorderFields: string): Chainable<any>

    /**
     * Custom command to submit form.
     * @param form Form name.
     * @example cy.submitFormCy('register-form')
     */
    submitFormCy(form: string): Chainable<any>

    /**
     * Custom command to hide navbar.
     * @param device Device type.
     * @example cy.hideNavbarCy()
     */
    hideNavbarCy(device: string): Chainable<any>

    /**
     * Custom command to check if 2FA page is working as expected.
     * @param emailHash Email hash.
     * @param formContainer Form container.
     * @example cy.check2FAPage(emailHash, 'registration-container')
     */
    check2FAPage(emailHash: string, formContainer: string): Chainable<any>
  }
}

Cypress.Commands.add('checkFormFieldsNotInErrorStateCy', (form, errorBorderFields) => {
  cy.dataCy(form).then((form) => {
    cy.wrap(Cypress.$(errorBorderFields, form)).should(
      'not.have.class',
      'border-negative-700',
    )
  })
})

Cypress.Commands.add('submitFormCy', (form) => {
  cy.dataCy(form).then((form) => {
    cy.wrap(Cypress.$('button[type=submit]', form)).click()
  })
})

Cypress.Commands.add('hideNavbarCy', (device) => {
  cy.get(`#${device}-navbar`).invoke('attr', 'style', 'display: none')
})

Cypress.Commands.add('check2FAPage', (emailHash, formContainer) => {
  const visualTestingIgnore = ['[data-cy=verification-description]']

  cy.dataCy('verification-description').contains(emailHash)
  cy.dataCy('verification-form').then((form) => {
    cy.wrap(Cypress.$('button[type=submit]', form)).click()

    cy.wrap(Cypress.$('[data-cy=input-verificationCode]', form)).should(
      'have.class',
      'border-negative-700',
    )
  })
  cy.dataCy(formContainer)
    .should('be.visible')
    .matchImage({ screenshotConfig: { blackout: visualTestingIgnore } })
})