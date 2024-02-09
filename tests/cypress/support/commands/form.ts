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

    /**
     * Custom command to fill in type of tax return.
     * @param form form object.
     * @param druhPriznania data.
     * @example cy.fillTypeOfTaxReturn(form, druhPriznania)
     */
    fillTypeOfTaxReturn(form: object, druhPriznania: string): Chainable<any>

    /**
     * Custom command to fill in calculator use.
     * @param form form object.
     * @param useCalculator data.
     * @param checkboxGroup data.
     * @example cy.useCalculator(form, useCalculator)
     */
    useCalculator(form: object, useCalculator: boolean, checkboxGroup: string): Chainable<any>

    /**
     * Custom command to fill in calculator use.
     * @param form form object.
     * @param device device type.
     * @example cy.clickNoAndContinue(form, 'mobile')
     */
    clickNoAndContinue(form: object, device: string): Chainable<any>

    /**
     * Custom command to fill in calculator use.
     * @param form form object.
     * @param select data cy string.
     * @param data data.
     * @example cy.select(form, 'select-názov-katastrálneho-územia', data)
     */
    selectFromDropdown(form: object, select: string, data: string): Chainable<any>

    /**
     * Custom command to validate step.
     * @param stepIndex step index.
     * @param fillInStep boolean.
     * @param device device.
     * @param numberOfInputs number of inputs to check.
     * @param inputs list on inputs.
     * @example cy.stepValidation(6, this.fileData.danZBytovANebytovychPriestorov.vyplnitObject.vyplnit, device, 9, nonResidentialTaxBorderFields)
     */
    stepValidation(stepIndex: number, fillInStep: boolean, device: string, numberOfInputs: number, inputs: string): Chainable<any>
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

Cypress.Commands.add('fillTypeOfTaxReturn', (form, druhPriznania) => {
  let radioGroup = cy.wrap(Cypress.$('[data-cy=radio-group-vyberte-druh-priznania]', form))
  if (druhPriznania === 'priznanie') {
    radioGroup.find(`[data-cy=radio-priznanie]`).click()
  } else if (druhPriznania === 'ciastkovePriznanie') {
    radioGroup.find(`[data-cy=radio-čiastkové-priznanie]`).click()
  } else if (druhPriznania === 'ciastkovePriznanieNaZanikDanovejPovinnosti') {
    radioGroup.find(`[data-cy=radio-čiastkové-priznanie-na-zánik-daňovej-povinnosti]`).click()
  } else if (druhPriznania === 'opravnePriznanie') {
    radioGroup.find(`[data-cy=radio-opravné-priznanie]`).click()
  } else if (druhPriznania === 'dodatocnePriznanie') {
    radioGroup.find(`[data-cy=radio-opravné-priznanie]`).click()
  }
})

Cypress.Commands.add('useCalculator', (form, useCalculator, checkboxGroup) => {
  if (!useCalculator) {
    cy.wrap(Cypress.$(`[data-cy=${checkboxGroup}]`, form)).find(`[data-cy=checkbox-true]`).click()
  }
})

Cypress.Commands.add('clickNoAndContinue', (form, device) => {
  cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
  cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
})

Cypress.Commands.add('selectFromDropdown', (form, select, data) => {
  cy.wrap(Cypress.$(`[data-cy=${select}]`, form)).click()
  cy.wrap(Cypress.$(`[data-cy=${select}]`, form)).type(data + "{enter}{enter}")
})

Cypress.Commands.add('stepValidation', (stepIndex, fillInStep, device, numberOfInputs, inputs) => {
  cy.checkActiveStep(stepIndex)
  if (fillInStep) {
    cy.dataCy('form-container').then((form) => {
      cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
    })
    cy.dataCy('form-container').then((form) => {   
      cy.checkFormValidation(device, form, numberOfInputs, inputs)
    })
  } else {
    cy.dataCy('form-container').then((form) => {
      cy.clickNoAndContinue(form, device)
    })
  }
})