/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to check active step.
     * @param stepIndex step number.
     * @example cy.checkActiveStep(1)
     */
    checkActiveStep(stepIndex: number): Chainable<any>

    /**
     * Custom command to check form validation.
     * @param device device type.
     * @param form form object.
     * @param required number of required inputs in form.
     * @param fields fields to check for error border.
     * @example cy.checkFormValidation(device, form, 13, taxpayerBorderFields)
     */
    checkFormValidation(device: string, form: object, required: number, fields: string): Chainable<any>

    /**
     * Custom command to select state from dowpdown.
     * @param form form object.
     * @param esbsNationalityCiselnik number of required inputs in form.
     * @param state fields to check for error border.
     * @example cy.checkFormValidation(device, form, 13, taxpayerBorderFields)
     */
    selectState(form: object, esbsNationalityCiselnik: [{
      Code: string,
      Name: string,
      WsEnumCode: string,
    }], state: string): Chainable<any>

    /**
     * Custom command to fill in address.
     * @param form form object.
     * @param ulica data.
     * @param cislo data.
     * @param obec data.
     * @param psc data.
     * @example cy.fillInAddress(device, form, 13, taxpayerBorderFields)
     */
    fillInAddress(form: object, ulica: string, cislo: string, obec: string, psc: string): Chainable<any>

    /**
     * Custom command to fill in legal information.
     * @param form form object.
     * @param rodneCislo data.
     * @param priezvisko data.
     * @param meno data.
     * @example cy.fillInLegalInformation(form, rodneCislo, priezvisko, meno)
     */
    fillInLegalInformation(form: object, rodneCislo: string, priezvisko: string, meno: string): Chainable<any>

    /**
     * Custom command to select legal relationship.
     * @param device device type.
     * @param form form object.
     * @param index index.
     * @param vztah data.
     * @example cy.selectLegalRelationship(form, 13, vztah)
     */
    selectLegalRelationship(form: object, index: number, vztah: string): Chainable<any>

    /**
     * Custom command to fill in apartment information.
     * @param form form object.
     * @param podielPriestoru data.
     * @param spoluvlastnickyPodiel data.
     * @example cy.fillInApartmentInformation(device, form, 13, taxpayerBorderFields)
     */
    fillInApartmentInformation(form: object, podielPriestoru: string, spoluvlastnickyPodiel: string): Chainable<any>

    /**
     * Custom command to fill in house information.
     * @param form form object.
     * @param index index.
     * @param ulicaACisloDomu data.
     * @param supisneCislo data.
     * @param kataster data.
     * @param cisloParcely data.
     * @example cy.fillHouseInformation(form, 13, ulicaACisloDomu, supisneCislo, kataster, cisloParcely)
     */
    fillHouseInformation(form: object, index: number, ulicaACisloDomu: string, supisneCislo: string, kataster: string, cisloParcely: string): Chainable<any>

    /**
     * Custom command to fill in owner information.
     * @param form form object.
     * @param spoluvlastnictvo data.
     * @example cy.fillOwner(form, spoluvlastnictvo)
     */
    fillOwner(form: object, spoluvlastnictvo: string): Chainable<any>
  }
}

Cypress.Commands.add('checkActiveStep', (stepIndex) => {
  cy.dataCy('stepper-step-active').contains(stepIndex)
})

Cypress.Commands.add('checkFormValidation', (device, form, required, fields) => {
  cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
  cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', required)     
  cy.wrap(Cypress.$(fields, form)).should('have.class', 'border-negative-700')
})

Cypress.Commands.add('selectState', (form, esbsNationalityCiselnik, state) => {
  if (state !== '703') {
    let foundState = esbsNationalityCiselnik.find((stateFromCiselnik) => {
      return stateFromCiselnik.Code == state
    })

    cy.wrap(Cypress.$('[data-cy=select-štát]', form)).click()
    cy.wrap(Cypress.$('[data-cy=select-štát]', form)).type(foundState.Name + "{enter}{enter}")
  }
})

Cypress.Commands.add('fillInAddress', (form, ulica, cislo, obec, psc) => {
  cy.wrap(Cypress.$(`[data-cy=input-ulica]`, form)).type(ulica)
  cy.wrap(Cypress.$(`[data-cy=input-cislo]`, form)).type(cislo)
  cy.wrap(Cypress.$(`[data-cy=input-obec]`, form)).type(obec)
  cy.wrap(Cypress.$(`[data-cy=input-psc]`, form)).type(psc) 
})

Cypress.Commands.add('fillInLegalInformation', (form, rodneCislo, priezvisko, meno) => {
  cy.wrap(Cypress.$(`[data-cy=input-rodneCislo]`, form)).type(rodneCislo)
  cy.wrap(Cypress.$(`[data-cy=input-priezvisko]`, form)).type(priezvisko)
  cy.wrap(Cypress.$(`[data-cy=input-meno]`, form)).type(meno)
})

Cypress.Commands.add('selectLegalRelationship', (form, index, vztah) => {
  if (vztah === 'vlastnik') {
    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', form)).find(`[data-cy=radio-vlastník]`).click()
  } else if (vztah === 'spravca') {
    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', form)).find(`[data-cy=radio-správca]`).click()
  } else if (vztah === 'najomca') {
    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', form)).find(`[data-cy=radio-nájomca]`).click()
  } else if (vztah === 'uzivatel') {
    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', form)).find(`[data-cy=radio-užívateľ]`).click()
  }
})

Cypress.Commands.add('fillInApartmentInformation', (form, podielPriestoru, spoluvlastnickyPodiel) => {
  cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', form)).eq(0).type(podielPriestoru)
  
  cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', form)).eq(0).type(spoluvlastnickyPodiel)
})

Cypress.Commands.add('fillHouseInformation', (form, index, ulicaACisloDomu, supisneCislo, kataster, cisloParcely) => {
  cy.wrap(Cypress.$('[data-cy=input-ulicaACisloDomu]', form)).type(ulicaACisloDomu)
  cy.wrap(Cypress.$('[data-cy=input-supisneCislo]', form)).type(supisneCislo)
  cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', form)).click()
  cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', form)).type(kataster + "{enter}{enter}")
  cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', form)).type(cisloParcely)
})

Cypress.Commands.add('fillOwner', (form, spoluvlastnictvo) => {
  if (spoluvlastnictvo === 'somJedinyVlastnik') {
    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', form)).find(`[data-cy=radio-som-jediný-vlastník]`).click()
  } else if (spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', form)).find(`[data-cy=radio-podielové-spoluvlastníctvo]`).click()
  } else if (spoluvlastnictvo === 'bezpodieloveSpoluvlastnictvoManzelov') {
    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', form)).find(`[data-cy=radio-bezpodielové-spoluvlastníctvo-manželov]`).click()
  }
})