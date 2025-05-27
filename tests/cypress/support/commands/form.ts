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
    checkFormValidation(
      device: string,
      form: object,
      required: number,
      fields: string,
    ): Chainable<any>

    /**
     * Custom command to select state from dowpdown.
     * @param form form object.
     * @param esbsNationalityCiselnik number of required inputs in form.
     * @param state fields to check for error border.
     * @example cy.checkFormValidation(device, form, 13, taxpayerBorderFields)
     */
    selectState(
      form: object,
      esbsNationalityCiselnik: [
        {
          Code: string
          Name: string
          WsEnumCode: string
        },
      ],
      state: string,
    ): Chainable<any>

    /**
     * Custom command to fill in address.
     * @param form form object.
     * @param street data.
     * @param number data.
     * @param municipality data.
     * @param zipCode data.
     * @example cy.fillInAddress(device, form, 13, taxpayerBorderFields)
     */
    fillInAddress(
      form: object,
      street: string,
      number: string,
      municipality: string,
      zipCode: string,
    ): Chainable<any>

    /**
     * Custom command to fill in legal information.
     * @param form form object.
     * @param personalIdNumber data.
     * @param surname data.
     * @param name data.
     * @example cy.fillInLegalInformation(form, personalIdNumber, surname, name)
     */
    fillInLegalInformation(
      form: object,
      personalIdNumber: string,
      surname: string,
      name: string,
    ): Chainable<any>

    /**
     * Custom command to select legal relationship.
     * @param device device type.
     * @param form form object.
     * @param index index.
     * @param relationship data.
     * @example cy.selectLegalRelationship(form, 13, relationship)
     */
    selectLegalRelationship(form: object, index: number, relationship: string): Chainable<any>

    /**
     * Custom command to fill in apartment information.
     * @param form form object.
     * @param shareOfSpace data.
     * @param jointShare data.
     * @example cy.fillInApartmentInformation(form, '1/2', '1/2')
     */
    fillInApartmentInformation(
      form: object,
      shareOfSpace: string,
      jointShare: string,
      cisloNebytovehoPriestoruVBytovomDome?: string,
      ucelVyuzitiaNebytovehoPriestoruVBytovomDome?: string,
    ): Chainable<any>

    /**
     * Custom command to fill in house information.
     * @param form form object.
     * @param index index.
     * @param streetHouseNumber data.
     * @param referenceNumber data.
     * @param landRegistry data.
     * @param parcelNumber data.
     * @example cy.fillHouseInformation(form, 13, streetHouseNumber, referenceNumber, landRegistry, parcelNumber)
     */
    fillHouseInformation(
      form: object,
      index: number,
      streetHouseNumber: string,
      referenceNumber: string,
      landRegistry: string,
      parcelNumber: string,
    ): Chainable<any>

    /**
     * Custom command to fill in owner information.
     * @param form form object.
     * @param coownership data.
     * @example cy.fillOwner(form, coownership)
     */
    fillOwner(form: object, coownership: string): Chainable<any>

    /**
     * Custom command to fill in type of tax return.
     * @param form form object.
     * @param typeOfReturn data.
     * @example cy.fillTypeOfTaxReturn(form, typeOfReturn)
     */
    fillTypeOfTaxReturn(form: object, typeOfReturn: string): Chainable<any>

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
    stepValidation(
      stepIndex: number,
      fillInStep: boolean,
      device: string,
      numberOfInputs: number,
      inputs: string,
    ): Chainable<any>

    /**
     * Custom command to click radio.
     * @param form form object.
     * @param radioGroup data cy string.
     * @param condition data.
     * @example cy.clickRadio(form, 'je-korešpondenčná-adresa-rovnáká-ako-adresa-trvalého-pobytu', this.fileData.udajeODanovnikovi.korespondencnaAdresa.korespondencnaAdresaRovnaka)
     */
    clickRadio(form: object, radioGroup: string, condition: boolean): Chainable<any>
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
    const foundState = esbsNationalityCiselnik.find((stateFromCiselnik) => {
      return stateFromCiselnik.Code == state
    })

    cy.selectFromDropdown(form, 'select-štát', foundState.Name)
  }
})

Cypress.Commands.add('fillInAddress', (form, street, number, municipality, zipCode) => {
  cy.wrap(Cypress.$(`[data-cy=input-ulica]`, form)).type(street)
  cy.wrap(Cypress.$(`[data-cy=input-cislo]`, form)).type(number)
  cy.wrap(Cypress.$(`[data-cy=input-obec]`, form)).type(municipality)
  cy.wrap(Cypress.$(`[data-cy=input-psc]`, form)).type(zipCode)
})

Cypress.Commands.add('fillInLegalInformation', (form, personalIdNumber, surname, name) => {
  cy.wrap(Cypress.$(`[data-cy=input-rodneCislo]`, form)).type(personalIdNumber)
  cy.wrap(Cypress.$(`[data-cy=input-priezvisko]`, form)).type(surname)
  cy.wrap(Cypress.$(`[data-cy=input-meno]`, form)).type(name)
})

Cypress.Commands.add('selectLegalRelationship', (form, index, relationship) => {
  if (relationship === 'vlastnik') {
    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', form))
      .find(`[data-cy=radio-vlastník]`)
      .click()
  } else if (relationship === 'spravca') {
    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', form))
      .find(`[data-cy=radio-správca]`)
      .click()
  } else if (relationship === 'najomca') {
    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', form))
      .find(`[data-cy=radio-nájomca]`)
      .click()
  } else if (relationship === 'uzivatel') {
    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', form))
      .find(`[data-cy=radio-užívateľ]`)
      .click()
  }
})

Cypress.Commands.add(
  'fillInApartmentInformation',
  (
    form,
    shareOfSpace,
    jointShare,
    cisloNebytovehoPriestoruVBytovomDome,
    ucelVyuzitiaNebytovehoPriestoruVBytovomDome,
  ) => {
    cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', form))
      .eq(0)
      .type(shareOfSpace)

    cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', form)).eq(0).type(jointShare)

    if (cisloNebytovehoPriestoruVBytovomDome) {
      cy.wrap(Cypress.$('[data-cy=input-cisloNebytovehoPriestoruVBytovomDome]', form))
        .eq(0)
        .type(cisloNebytovehoPriestoruVBytovomDome)
    }
    if (ucelVyuzitiaNebytovehoPriestoruVBytovomDome) {
      cy.wrap(Cypress.$('[data-cy=input-ucelVyuzitiaNebytovehoPriestoruVBytovomDome]', form))
        .eq(0)
        .type(ucelVyuzitiaNebytovehoPriestoruVBytovomDome)
    }
  },
)

Cypress.Commands.add(
  'fillHouseInformation',
  (form, index, streetHouseNumber, referenceNumber, landRegistry, parcelNumber) => {
    cy.wrap(Cypress.$('[data-cy=input-ulicaACisloDomu]', form)).type(streetHouseNumber)
    cy.wrap(Cypress.$('[data-cy=number-supisneCislo]', form)).type(referenceNumber)
    cy.selectFromDropdown(form, 'select-názov-katastrálneho-územia', landRegistry)
    cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', form)).type(parcelNumber)
  },
)

Cypress.Commands.add('fillOwner', (form, coownership) => {
  if (coownership === 'somJedinyVlastnik') {
    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', form))
      .find(`[data-cy=radio-som-jediný-vlastník]`)
      .click()
  } else if (coownership === 'podieloveSpoluvlastnictvo') {
    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', form))
      .find(`[data-cy=radio-podielové-spoluvlastníctvo]`)
      .click()
  } else if (coownership === 'bezpodieloveSpoluvlastnictvoManzelov') {
    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', form))
      .find(`[data-cy=radio-bezpodielové-spoluvlastníctvo-manželov]`)
      .click()
  }
})

Cypress.Commands.add('fillTypeOfTaxReturn', (form, typeOfReturn) => {
  const radioGroup = cy.wrap(Cypress.$('[data-cy=radio-group-vyberte-druh-priznania]', form))
  if (typeOfReturn === 'priznanie') {
    radioGroup.find(`[data-cy=radio-priznanie]`).click()
  } else if (typeOfReturn === 'ciastkovePriznanie') {
    radioGroup.find(`[data-cy=radio-čiastkové-priznanie]`).click()
  } else if (typeOfReturn === 'ciastkovePriznanieNaZanikDanovejPovinnosti') {
    radioGroup.find(`[data-cy=radio-čiastkové-priznanie-na-zánik-daňovej-povinnosti]`).click()
  } else if (typeOfReturn === 'opravnePriznanie') {
    radioGroup.find(`[data-cy=radio-opravné-priznanie]`).click()
  } else if (typeOfReturn === 'dodatocnePriznanie') {
    radioGroup.find(`[data-cy=radio-opravné-priznanie]`).click()
  }
})

Cypress.Commands.add('useCalculator', (form, useCalculator, checkboxGroup) => {
  if (!useCalculator) {
    cy.wrap(Cypress.$(`[data-cy=${checkboxGroup}]`, form))
      .find(`[data-cy=checkbox-true]`)
      .click()
  }
})

Cypress.Commands.add('clickNoAndContinue', (form, device) => {
  cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
  cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
})

Cypress.Commands.add('selectFromDropdown', (form, select, data) => {
  cy.wrap(form).find(`[data-cy=${select}]`).as('selectElement')
  cy.get('@selectElement').click()
  cy.get('@selectElement').type(data)

  cy.get('@selectElement').find('div[role=option]').contains(data).should('be.visible').click()
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

Cypress.Commands.add('clickRadio', (form, radioGroup, condition) => {
  const radioGroupEl = cy.wrap(Cypress.$(`[data-cy=radio-group-${radioGroup}]`, form))
  if (condition) {
    radioGroupEl.find(`[data-cy=radio-áno]`).click()
  } else {
    radioGroupEl.find(`[data-cy=radio-nie]`).click()
  }
})
