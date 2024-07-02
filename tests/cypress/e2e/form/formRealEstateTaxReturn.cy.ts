/// <reference types="cypress" />

const path = require('path')
const {
  esbsNationalityCiselnik,
} = require('../../../../forms-shared/src/schemas/priznanie-k-dani-z-nehnutelnosti/esbsCiselniky')

describe('F05 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']
  const jsonSources = [
    'formRealEstateTaxReturn/formRealEstateTaxReturn-1.json',
    'formRealEstateTaxReturn/formRealEstateTaxReturn-2.json',
    'formRealEstateTaxReturn/formRealEstateTaxReturn-3.json',
    'formRealEstateTaxReturn/formRealEstateTaxReturn-4.json',
    'formRealEstateTaxReturn/formRealEstateTaxReturn-5.json',
  ]

  before(() => {
    cy.fixture('formRealEstateTaxReturnInputs.json').then((fileData) => {
      this.inputData = fileData
    })
  })

  for (let i = 1; i <= jsonSources.length; i++) {
    context(`Source file ${i}`, () => {
      devices
        .filter((device) => Cypress.env('devices')[`${device}`])
        .forEach((device) => {
          context(device, Cypress.env('resolution')[`${device}`], () => {
            before(() => {
              cy.fixture(jsonSources[i - 1]).then((fileData) => {
                this.fileData = fileData
              })

              cy.visit('/mestske-sluzby/priznanie-k-dani-z-nehnutelnosti')
            })

            beforeEach(() => {
              cy.hideNavbar(device)
            })

            it('1. Choosing how to fill out the return.', () => {
              cy.dataCy('tax-form-landing-page-card-bratislavske-konto').click()
            })

            it('2. Checking "Type of tax return" step validation.', () => {
              cy.checkActiveStep(1)
              cy.dataCy('form-container').then((form) => {
                cy.checkFormValidation(device, form, 2, '[data-cy=input-rok]')
              })
            })

            it('3. Filling out "Type of tax return" step.', () => {
              cy.dataCy('form-container').then((form) => {
                cy.fillTypeOfTaxReturn(form, this.fileData.druhPriznania.druh)
                cy.wrap(Cypress.$('[data-cy=input-rok]', form)).type(
                  this.fileData.druhPriznania.rok,
                )
                cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form))
                  .click()
                  .click()
              })
            })

            it('4. Checking "Taxpayer data" step validation.', () => {
              cy.checkActiveStep(2)
              cy.dataCy('form-container').then((form) => {
                cy.checkFormValidation(device, form, 13, this.inputData.taxpayerBorderFields)
              })
            })

            it('5. Filling out "Taxpayer data" step', () => {
              const taxpayer = this.fileData.udajeODanovnikovi
              cy.dataCy('form-container').then((form) => {
                cy.clickRadio(
                  form,
                  'podávate-priznanie-k-dani-z-nehnuteľností-vo-svojom-mene',
                  taxpayer.voSvojomMene,
                )
                const radioGroupFillingAs = cy.wrap(
                  Cypress.$('[data-cy=radio-group-podávate-priznanie-ako]', form),
                )
                if (taxpayer.priznanieAko === 'fyzickaOsoba') {
                  radioGroupFillingAs.find(`[data-cy=radio-fyzická-osoba]`).click()
                } else if (taxpayer.priznanieAko === 'fyzickaOsobaPodnikatel') {
                  radioGroupFillingAs.find(`[data-cy=radio-fyzická-osoba-podnikateľ]`).click()
                } else if (taxpayer.priznanieAko === 'pravnickaOsoba') {
                  radioGroupFillingAs.find(`[data-cy=radio-právnicka-osoba]`).click()
                }
                cy.fillInLegalInformation(
                  form,
                  taxpayer.rodneCislo,
                  taxpayer.priezvisko,
                  taxpayer.menoTitul.meno,
                )
                cy.fillInAddress(
                  form,
                  taxpayer.ulicaCisloFyzickaOsoba.ulica,
                  taxpayer.ulicaCisloFyzickaOsoba.cislo,
                  taxpayer.obecPsc.obec,
                  taxpayer.obecPsc.psc,
                )
                cy.selectState(form, esbsNationalityCiselnik, taxpayer.stat)
                cy.clickRadio(
                  form,
                  'je-korešpondenčná-adresa-rovnáká-ako-adresa-trvalého-pobytu',
                  taxpayer.korespondencnaAdresa.korespondencnaAdresaRovnaka,
                )
                cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(taxpayer.email)
                cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).type(taxpayer.telefon)
              })
              const correspondenceAddress = taxpayer.korespondencnaAdresa
              if (!correspondenceAddress.korespondencnaAdresaRovnaka) {
                cy.dataCy(`fieldset-root_udajeODanovnikovi_korespondencnaAdresa`).within(
                  (fieldset) => {
                    cy.fillInAddress(
                      fieldset,
                      correspondenceAddress.ulicaCisloKorespondencnaAdresa.ulica,
                      correspondenceAddress.ulicaCisloKorespondencnaAdresa.cislo,
                      correspondenceAddress.obecPsc.obec,
                      correspondenceAddress.obecPsc.psc,
                    )
                  },
                )
              }
              cy.dataCy('form-container').then((form) => {
                cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form))
                  .click()
                  .click()
              })
            })

            it('6. Checking "Land tax return" step validation.', () => {
              cy.stepValidation(
                3,
                this.fileData.danZPozemkov.vyplnitObject.vyplnit,
                device,
                9,
                this.inputData.landTaxBorderFields,
              )
            })

            it('7. Filling out "Land tax return" step.', () => {
              const landTax = this.fileData.danZPozemkov
              if (landTax.vyplnitObject.vyplnit) {
                cy.dataCy('form-container').then((form) => {
                  cy.useCalculator(
                    form,
                    landTax.kalkulackaWrapper.pouzitKalkulacku,
                    'checkbox-group-kalkulačka-výpočtu-výmery-pozemkov',
                  )
                  cy.get(landTax.priznania).each((dataPriznania, indexPriznania) => {
                    if (indexPriznania > 0) {
                      cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(1)).click()
                    }
                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.selectLegalRelationship(
                        priznania,
                        indexPriznania,
                        landTax.priznania[indexPriznania].pravnyVztah,
                      )
                      cy.fillOwner(priznania, landTax.priznania[indexPriznania].spoluvlastnictvo)
                      cy.get(landTax.priznania[indexPriznania].pozemky).each(
                        (dataPozemky, indexPozemky) => {
                          if (indexPozemky > 0) {
                            cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                          }
                          cy.dataCy(`section-pozemky-${indexPozemky}`).within((pozemky) => {
                            cy.wrap(
                              Cypress.$('[data-cy=input-cisloListuVlastnictva]', pozemky),
                            ).type(
                              landTax.priznania[indexPriznania].pozemky[indexPozemky]
                                .cisloListuVlastnictva,
                            )
                            cy.selectFromDropdown(
                              pozemky,
                              'select-názov-katastrálneho-územia',
                              landTax.priznania[indexPriznania].pozemky[indexPozemky].kataster,
                            )
                            cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', pozemky)).type(
                              landTax.priznania[indexPriznania].pozemky[indexPozemky]
                                .parcelneCisloSposobVyuzitiaPozemku.cisloParcely,
                            )
                            cy.selectFromDropdown(
                              pozemky,
                              'select-druh-pozemku',
                              landTax.priznania[indexPriznania].pozemky[indexPozemky].druhPozemku +
                                ' – ',
                            )
                            cy.wrap(
                              Cypress.$('[data-cy=input-celkovaVymeraPozemku]', pozemky),
                            ).type(
                              landTax.priznania[indexPriznania].pozemky[indexPozemky]
                                .celkovaVymeraPozemku,
                            )
                            cy.fillInApartmentInformation(
                              pozemky,
                              landTax.priznania[indexPriznania].pozemky[0]
                                .podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
                              landTax.priznania[indexPriznania].pozemky[indexPozemky]
                                .spoluvlastnickyPodiel,
                            )
                          })
                        },
                      )
                    })
                  })

                  cy.get(landTax.priznania).each((dataPriznania, indexPriznania) => {
                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.get(landTax.priznania[indexPriznania].pozemky).each(
                        (dataPozemky, indexPozemky) => {
                          cy.dataCy(`section-pozemky-${indexPozemky}`).within((pozemky) => {
                            cy.wrap(
                              Cypress.$(
                                '[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]',
                                pozemky,
                              ),
                            )
                              .focus()
                              .clear()
                            cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', pozemky))
                              .focus()
                              .clear()
                            cy.fillInApartmentInformation(
                              pozemky,
                              landTax.priznania[indexPriznania].pozemky[0]
                                .podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
                              landTax.priznania[indexPriznania].pozemky[indexPozemky]
                                .spoluvlastnickyPodiel,
                            )
                          })
                        },
                      )
                    })
                  })
                  cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form))
                    .click()
                    .click()
                })
              }
            })

            it('8. Checking "Construction tax return - one purpose" step validation.', () => {
              cy.stepValidation(
                4,
                this.fileData.danZoStaviebJedenUcel.vyplnitObject.vyplnit,
                device,
                12,
                this.inputData.onePurposeTaxBorderFields,
              )
            })

            it('9. Filling out "Construction tax return - one purpose" step.', () => {
              const onePurposeTax = this.fileData.danZoStaviebJedenUcel
              if (onePurposeTax.vyplnitObject.vyplnit) {
                cy.dataCy('form-container').then((form) => {
                  cy.useCalculator(
                    form,
                    onePurposeTax.kalkulackaWrapper.pouzitKalkulacku,
                    'checkbox-group-kalkulačka-výpočtu-výmery-pozemkov',
                  )
                  cy.get(onePurposeTax.priznania).each((dataPriznania, indexPriznania) => {
                    if (indexPriznania > 0) {
                      cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                    }
                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.fillHouseInformation(
                        priznania,
                        indexPriznania,
                        onePurposeTax.priznania[indexPriznania].riadok1.ulicaACisloDomu,
                        onePurposeTax.priznania[indexPriznania].riadok1.supisneCislo,
                        onePurposeTax.priznania[indexPriznania].riadok2.kataster,
                        onePurposeTax.priznania[indexPriznania].riadok2.cisloParcely,
                      )
                      cy.selectLegalRelationship(
                        priznania,
                        indexPriznania,
                        onePurposeTax.priznania[indexPriznania].pravnyVztah,
                      )
                      cy.fillOwner(
                        priznania,
                        onePurposeTax.priznania[indexPriznania].spoluvlastnictvo,
                      )
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.selectFromDropdown(
                        priznania,
                        'select-predmet-dane',
                        onePurposeTax.priznania[indexPriznania].predmetDane + ') ',
                      )
                      cy.wrap(Cypress.$('[data-cy=input-celkovaZastavanaPlocha]', priznania)).type(
                        onePurposeTax.priznania[indexPriznania].celkovaZastavanaPlocha,
                      )
                      cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', priznania)).type(
                        onePurposeTax.priznania[indexPriznania].spoluvlastnickyPodiel + '{enter}',
                      )
                      cy.wrap(
                        Cypress.$(
                          '[data-cy=input-pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia]',
                          priznania,
                        ),
                      ).type(
                        onePurposeTax.priznania[indexPriznania]
                          .pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia +
                          '{enter}',
                      )
                      if (
                        onePurposeTax.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily
                      ) {
                        cy.wrap(
                          Cypress.$(
                            `[data-cy=radio-group-máte-časť-stavby-ktorá-podlieha-oslobodeniu-od-dane-zo-stavieb-podľa--17-zákona-č-5822004-zz-a-vzn]`,
                            priznania,
                          ),
                        )
                          .find(`[data-cy=radio-áno]`)
                          .click()
                      }
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      if (
                        onePurposeTax.priznania[indexPriznania].spoluvlastnictvo ===
                        'podieloveSpoluvlastnictvo'
                      ) {
                        cy.wrap(Cypress.$('[data-cy=input-pocetSpoluvlastnikov]', priznania)).type(
                          onePurposeTax.priznania[indexPriznania].pocetSpoluvlastnikov + '{enter}',
                        )
                        cy.clickRadio(
                          priznania,
                          'podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody',
                          onePurposeTax.priznania[indexPriznania].naZakladeDohody,
                        )
                      }

                      if (
                        onePurposeTax.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily
                      ) {
                        cy.wrap(
                          Cypress.$(
                            '[data-cy=input-celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby]',
                            priznania,
                          ),
                        ).type(
                          onePurposeTax.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily
                            .celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby,
                        )
                        cy.wrap(
                          Cypress.$(
                            '[data-cy=input-vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb]',
                            priznania,
                          ),
                        ).type(
                          onePurposeTax.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily
                            .vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
                        )
                      }
                    })
                  })

                  // TODO duplicated code
                  cy.get(onePurposeTax.priznania).each((dataPriznania, indexPriznania) => {
                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(
                        onePurposeTax.priznania[indexPriznania].riadok2.cisloParcely,
                      )
                    })
                  })

                  cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
                })
              }
            })

            it('10. Checking "Construction tax return - multi purpose" step validation.', () => {
              cy.stepValidation(
                5,
                this.fileData.danZoStaviebViacereUcely.vyplnitObject.vyplnit,
                device,
                14,
                this.inputData.multiPurposeTaxBorderFields,
              )
            })

            it('11. Filling out "Construction tax return - multi purpose" step.', () => {
              const multiPurposeTax = this.fileData.danZoStaviebViacereUcely
              if (multiPurposeTax.vyplnitObject.vyplnit) {
                cy.dataCy('form-container').then((form) => {
                  cy.useCalculator(
                    form,
                    multiPurposeTax.kalkulackaWrapper.pouzitKalkulacku,
                    'checkbox-group-kalkulačka-výpočtu-výmery-pozemkov',
                  )
                  cy.get(multiPurposeTax.priznania).each((dataPriznania, indexPriznania) => {
                    if (indexPriznania > 0) {
                      cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(1)).click()
                    }
                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.fillHouseInformation(
                        priznania,
                        indexPriznania,
                        multiPurposeTax.priznania[indexPriznania].riadok1.ulicaACisloDomu,
                        multiPurposeTax.priznania[indexPriznania].riadok1.supisneCislo,
                        multiPurposeTax.priznania[indexPriznania].riadok2.kataster,
                        multiPurposeTax.priznania[indexPriznania].riadok2.cisloParcely,
                      )
                      cy.selectLegalRelationship(
                        priznania,
                        indexPriznania,
                        multiPurposeTax.priznania[indexPriznania].pravnyVztah,
                      )
                      cy.fillOwner(
                        priznania,
                        multiPurposeTax.priznania[indexPriznania].spoluvlastnictvo,
                      )
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      if (
                        multiPurposeTax.priznania[indexPriznania].spoluvlastnictvo ===
                        'podieloveSpoluvlastnictvo'
                      ) {
                        cy.wrap(Cypress.$('[data-cy=input-pocetSpoluvlastnikov]', priznania)).type(
                          multiPurposeTax.priznania[indexPriznania].pocetSpoluvlastnikov,
                        )
                        cy.clickRadio(
                          priznania,
                          'podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody',
                          multiPurposeTax.priznania[indexPriznania].naZakladeDohody,
                        )
                      }
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      if (
                        multiPurposeTax.priznania[indexPriznania].spoluvlastnictvo ===
                          'podieloveSpoluvlastnictvo' &&
                        multiPurposeTax.priznania[indexPriznania].naZakladeDohody
                      ) {
                        cy.wrap(Cypress.$('[data-cy=file-input]', form)).attachFile(
                          '../files/test.pdf',
                        )
                      }
                      cy.wrap(Cypress.$('[data-cy=input-popisStavby]', priznania)).type(
                        multiPurposeTax.priznania[indexPriznania].popisStavby,
                      )
                      cy.wrap(Cypress.$('[data-cy=input-celkovaVymera]', priznania)).type(
                        multiPurposeTax.priznania[indexPriznania].celkovaVymera,
                      )
                      cy.wrap(
                        Cypress.$(
                          '[data-cy=input-pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia]',
                          priznania,
                        ),
                      ).type(
                        multiPurposeTax.priznania[indexPriznania]
                          .pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
                      )

                      if (
                        multiPurposeTax.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily
                      ) {
                        cy.wrap(
                          Cypress.$(
                            `[data-cy=radio-group-máte-časť-stavby-ktorá-podlieha-oslobodeniu-od-dane-zo-stavieb-podľa--17-zákona-č-5822004-zz-a-vzn]`,
                            priznania,
                          ),
                        )
                          .find(`[data-cy=radio-áno]`)
                          .click()
                      }
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      if (
                        multiPurposeTax.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily
                      ) {
                        cy.wrap(
                          Cypress.$(
                            '[data-cy=input-celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby]',
                            priznania,
                          ),
                        ).type(
                          multiPurposeTax.priznania[indexPriznania]
                            .celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby,
                        )
                        cy.wrap(
                          Cypress.$(
                            '[data-cy=input-vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb]',
                            priznania,
                          ),
                        ).type(
                          multiPurposeTax.priznania[indexPriznania]
                            .vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
                        )
                      }
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.get(
                        multiPurposeTax.priznania[indexPriznania].nehnutelnosti.nehnutelnosti,
                      ).each((dataNehnutelnosti, indexNehnutelnosti) => {
                        if (indexNehnutelnosti > 0) {
                          cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                        }
                        cy.dataCy(`section-nehnutelnosti-${indexNehnutelnosti}`).within(
                          (nehnutelnosti) => {
                            cy.selectFromDropdown(
                              nehnutelnosti,
                              'select-účel-využitia-stavby',
                              multiPurposeTax.priznania[indexPriznania].nehnutelnosti.nehnutelnosti[
                                indexNehnutelnosti
                              ].ucelVyuzitiaStavby + ') ',
                            )
                            cy.fillInApartmentInformation(
                              nehnutelnosti,
                              multiPurposeTax.priznania[indexPriznania].nehnutelnosti.nehnutelnosti[
                                indexNehnutelnosti
                              ].podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
                              multiPurposeTax.priznania[indexPriznania].nehnutelnosti.nehnutelnosti[
                                indexNehnutelnosti
                              ].spoluvlastnickyPodiel,
                            )
                          },
                        )
                      })
                    })
                  })

                  if (multiPurposeTax.vyplnitObject.vyplnit) {
                    cy.get(multiPurposeTax.priznania).each((dataPriznania, indexPriznania) => {
                      cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                        cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(
                          multiPurposeTax.priznania[indexPriznania].riadok2.cisloParcely,
                        )
                      })
                    })
                  }

                  cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form))
                    .click()
                    .click()
                })
              }
            })

            it('12. Checking "Tax return - apartments and non residential" step validation.', () => {
              cy.stepValidation(
                6,
                this.fileData.danZBytovANebytovychPriestorov.vyplnitObject.vyplnit,
                device,
                9,
                this.inputData.nonResidentialTaxBorderFields,
              )
            })

            it('13. Filling out "Tax return - apartments and non residential" step.', () => {
              const flatAndNonResTax = this.fileData.danZBytovANebytovychPriestorov
              if (flatAndNonResTax.vyplnitObject.vyplnit) {
                cy.dataCy('form-container').then((form) => {
                  cy.useCalculator(
                    form,
                    flatAndNonResTax.kalkulackaWrapper.pouzitKalkulacku,
                    'checkbox-group-kalkulačka-výpočtu-výmery-podlahových-plôch-bytov-a-nebytových-priestorov',
                  )
                  cy.get(flatAndNonResTax.priznania).each((dataPriznania, indexPriznania) => {
                    if (indexPriznania > 0) {
                      cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(1)).click()
                    }
                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).focus().clear()
                      cy.fillHouseInformation(
                        priznania,
                        indexPriznania,
                        flatAndNonResTax.priznania[indexPriznania].riadok1.ulicaACisloDomu,
                        flatAndNonResTax.priznania[indexPriznania].riadok1.supisneCislo,
                        flatAndNonResTax.priznania[indexPriznania].riadok2.kataster,
                        flatAndNonResTax.priznania[indexPriznania].riadok2.cisloParcely,
                      )

                      if (flatAndNonResTax.priznania[indexPriznania].pravnyVztah === 'vlastnik') {
                        cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania))
                          .find(`[data-cy=radio-vlastník]`)
                          .click()
                      } else if (
                        flatAndNonResTax.priznania[indexPriznania].pravnyVztah === 'spravca'
                      ) {
                        cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania))
                          .find(`[data-cy=radio-správca]`)
                          .click()
                      }

                      cy.fillOwner(
                        priznania,
                        flatAndNonResTax.priznania[indexPriznania].spoluvlastnictvo,
                      )
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.clickRadio(
                        priznania,
                        'podávate-priznanie-za-byt',
                        flatAndNonResTax.priznania[indexPriznania].priznanieZaByt.priznanieZaByt,
                      )
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      cy.clickRadio(
                        priznania,
                        'podávate-priznanie-za-nebytový-priestor-napr-garážové-státie-pivnica-obchodný-priestor-a-pod',
                        flatAndNonResTax.priznania[indexPriznania].priznanieZaNebytovyPriestor
                          .priznanieZaNebytovyPriestor,
                      )
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      if (
                        flatAndNonResTax.priznania[indexPriznania].spoluvlastnictvo ===
                        'podieloveSpoluvlastnictvo'
                      ) {
                        cy.wrap(Cypress.$('[data-cy=input-pocetSpoluvlastnikov]', priznania)).type(
                          flatAndNonResTax.priznania[indexPriznania].pocetSpoluvlastnikov +
                            '{enter}',
                        )
                        cy.clickRadio(
                          priznania,
                          'podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody',
                          flatAndNonResTax.priznania[indexPriznania].naZakladeDohody,
                        )
                      }
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      if (
                        flatAndNonResTax.priznania[indexPriznania].spoluvlastnictvo ===
                          'podieloveSpoluvlastnictvo' &&
                        flatAndNonResTax.priznania[indexPriznania].naZakladeDohody
                      ) {
                        cy.wrap(Cypress.$('[data-cy=file-input]', form)).attachFile(
                          '../files/test.pdf',
                        )
                      }
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      if (
                        flatAndNonResTax.priznania[indexPriznania].priznanieZaByt.priznanieZaByt
                      ) {
                        cy.wrap(Cypress.$('[data-cy=input-cisloBytu]', priznania)).type(
                          flatAndNonResTax.priznania[indexPriznania].priznanieZaByt.cisloBytu,
                        )

                        cy.fillInApartmentInformation(
                          priznania,
                          flatAndNonResTax.priznania[indexPriznania].priznanieZaByt
                            .podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
                          flatAndNonResTax.priznania[indexPriznania].priznanieZaByt
                            .spoluvlastnickyPodiel,
                        )
                      }
                    })

                    cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                      if (
                        flatAndNonResTax.priznania[indexPriznania].priznanieZaNebytovyPriestor
                          .priznanieZaNebytovyPriestor
                      ) {
                        cy.get(
                          flatAndNonResTax.priznania[indexPriznania].priznanieZaNebytovyPriestor
                            .nebytovePriestory,
                        ).each((dataProstory, indexProstory) => {
                          if (indexProstory > 0) {
                            cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                          }
                          cy.dataCy(`section-nebytovePriestory-${indexProstory}`).within(
                            (prostory) => {
                              cy.fillInApartmentInformation(
                                prostory,
                                flatAndNonResTax.priznania[indexPriznania]
                                  .priznanieZaNebytovyPriestor.nebytovePriestory[indexProstory]
                                  .podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
                                flatAndNonResTax.priznania[indexPriznania]
                                  .priznanieZaNebytovyPriestor.nebytovePriestory[indexProstory]
                                  .spoluvlastnickyPodiel,
                              )
                            },
                          )
                        })
                      }
                    })
                  })
                  // TODO duplicated code
                  if (this.fileData.danZoStaviebViacereUcely.vyplnitObject.vyplnit) {
                    cy.get(flatAndNonResTax.priznania).each((dataPriznania, indexPriznania) => {
                      cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                        cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania))
                          .focus()
                          .clear()
                        cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(
                          flatAndNonResTax.priznania[indexPriznania].riadok2.cisloParcely,
                        )
                      })
                    })
                  }
                  cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form))
                    .click()
                    .click()
                })
              }
            })

            it('14. Checking "Husband/wife information" step validation.', () => {
              if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov) {
                cy.checkActiveStep(7)
                cy.dataCy('form-container').then((form) => {
                  cy.checkFormValidation(device, form, 4, this.inputData.husbandWifeBorderFields)
                })
              }
            })

            it('15. Filling out "Husband/wife information" step.', () => {
              const spouseCoOwnership = this.fileData.bezpodieloveSpoluvlastnictvoManzelov
              if (spouseCoOwnership) {
                cy.dataCy('form-container').then((form) => {
                  cy.fillInLegalInformation(
                    form,
                    spouseCoOwnership.rodneCislo,
                    spouseCoOwnership.priezvisko,
                    spouseCoOwnership.menoTitul.meno,
                  )
                  cy.clickRadio(
                    form,
                    'má-trvalý-pobyt-na-rovnakej-adrese-ako-vy',
                    spouseCoOwnership.rovnakaAdresa,
                  )
                })
                cy.dataCy('form-container').then((form) => {
                  if (spouseCoOwnership.rovnakaAdresa == false) {
                    cy.fillInAddress(
                      form,
                      spouseCoOwnership.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov.ulica,
                      spouseCoOwnership.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov.cislo,
                      spouseCoOwnership.obecPsc.obec,
                      spouseCoOwnership.obecPsc.psc,
                    )
                    cy.selectState(form, esbsNationalityCiselnik, spouseCoOwnership.stat)
                  }
                  // TODO duplicated code
                  cy.dataCy('form-container').then((form) => {
                    cy.wrap(Cypress.$(`[data-cy=input-meno]`, form)).focus().clear()
                    cy.wrap(Cypress.$(`[data-cy=input-meno]`, form)).type(
                      spouseCoOwnership.menoTitul.meno,
                    )
                    if (spouseCoOwnership.rovnakaAdresa == false) {
                      cy.wrap(Cypress.$(`[data-cy=input-psc]`, form)).focus().clear()
                      cy.wrap(Cypress.$(`[data-cy=input-psc]`, form)).type(
                        spouseCoOwnership.obecPsc.psc,
                      )
                    }
                  })
                  cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
                })
              }
            })

            it('16. Filling out "Reduction or exemption from tax" step.', () => {
              cy.dataCy('form-container').then((form) => {
                this.fileData.bezpodieloveSpoluvlastnictvoManzelov
                  ? cy.checkActiveStep(8)
                  : cy.checkActiveStep(7)
                if (this.fileData.znizenieAleboOslobodenieOdDane.byty.length > 0) {
                  this.fileData.znizenieAleboOslobodenieOdDane.byty.map((byt) => {
                    cy.wrap(Cypress.$('[data-cy=checkbox-group-byty]', form))
                      .find(`[data-cy=checkbox-${byt}]`)
                      .click()
                  })
                }
                if (this.fileData.znizenieAleboOslobodenieOdDane.stavby.length > 0) {
                  this.fileData.znizenieAleboOslobodenieOdDane.stavby.map((stavba) => {
                    cy.wrap(Cypress.$('[data-cy=checkbox-group-stavby]', form))
                      .find(`[data-cy=checkbox-${stavba}]`)
                      .click()
                  })
                }
                if (this.fileData.znizenieAleboOslobodenieOdDane.pozemky.length > 0) {
                  this.fileData.znizenieAleboOslobodenieOdDane.pozemky.map((pozemok) => {
                    cy.wrap(Cypress.$('[data-cy=checkbox-group-pozemky]', form))
                      .find(`[data-cy=checkbox-${pozemok}]`)
                      .click()
                  })
                }
                cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
              })
            })

            it('17. Check summary and download pdf.', () => {
              cy.dataCy('form-container').then((form) => {
                cy.wrap(Cypress.$(`[data-cy=alert-container].bg-negative-100`, form)).should(
                  'not.exist',
                )
              })
              cy.dataCy('form-container').then((form) => {
                this.fileData.bezpodieloveSpoluvlastnictvoManzelov
                  ? cy.checkActiveStep(9)
                  : cy.checkActiveStep(8)
                cy.wrap(Cypress.$(this.inputData.summaryBorderFields, form)).should(
                  'not.have.class',
                  'border-red-500',
                )
                cy.wrap(Cypress.$(`[data-cy=download-pdf-button-${device}]`, form))
              })
            })

            it.skip('18. Check downloaded pdf.', () => {
              cy.readFile(
                path.join(
                  Cypress.config('downloadsFolder'),
                  'priznanie-k-dani-z-nehnutelnosti_output.pdf',
                ),
              ).should('exist')
            })
          })
        })
    })
  }
})
