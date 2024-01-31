/// <reference types="cypress" />

const path = require("path");
const { esbsNationalityCiselnik } = require("../../../../next/schema-generator/definitions/priznanie-k-dani-z-nehnutelnosti/esbsCiselniky")

describe('F05 -', { testIsolation: false }, () => {
  const devices = ['desktop', 'mobile']

  const taxpayerBorderFields = '[data-cy=input-email], [data-cy=input-rodneCislo], [data-cy=input-ulica], [data-cy=input-cislo], [data-cy=input-meno], [data-cy=input-telefon], [data-cy=input-obec], [data-cy=input-psc]'
  
  const landTaxBorderFields = '[data-cy=input-celkovaVymeraPozemku], [data-cy=input-cisloParcely], [data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu], [data-cy=input-spoluvlastnickyPodiel]'

  const onePurposeTaxBorderFields = '[data-cy=input-ulicaACisloDomu], [data-cy=input-supisneCislo], [data-cy=input-cisloParcely], [data-cy=input-celkovaZastavanaPlocha], [data-cy=input-spoluvlastnickyPodiel], [data-cy=input-pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia]'

  const multiPurposeTaxBorderFields = '[data-cy=input-ulicaACisloDomu], [data-cy=input-supisneCislo], [data-cy=input-cisloParcely], [data-cy=input-popisStavby], [data-cy=input-celkovaVymera], [data-cy=input-spoluvlastnickyPodiel], [data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu],[data-cy=input-pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia]'

  const nonResidentialTaxBorderFields = '[data-cy=input-ulicaACisloDomu], [data-cy=input-supisneCislo], [data-cy=input-cisloParcely]'

  const summaryBorderFields = '[data-cy=summary-row-rok], [data-cy=summary-row-rodneCislo], [data-cy=summary-row-priezvisko], [data-cy=summary-row-obec], [data-cy=summary-row-psc], [data-cy=summary-row-email], [data-cy=summary-row-telefon]'

  const husbandWifeBorderFields = '[data-cy=input-rodneCislo], [input-meno], [data-cy=input-priezvisko]'

  before(() => {
    cy.fixture('formRealEstateTaxReturn-1.json').then((fileData) => {
      this.fileData = fileData
    })
  })

  devices
    .filter((device) => Cypress.env('devices')[`${device}`])
    .forEach((device) => {
      context(device, Cypress.env('resolution')[`${device}`], () => {

        before(() => {
          cy.visit('/mestske-sluzby/priznanie-k-dani-z-nehnutelnosti')
        })
        
        beforeEach(() => {
          cy.hideNavbar(device)
        })
        
        it('1. Choosing how to fill out the return.', () => {
          cy.dataCy('tax-form-landing-page-card-bratislavske-konto').click()
          //cy.dataCy('tax-form-landing-page-card-esluzby-bratislava-sk').click()
          //cy.dataCy('tax-form-landing-page-card-pdf-priznanie').click()
        })

        it('2. Checking "Type of tax return" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.checkActiveStep(1)
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 2)     
            cy.wrap(Cypress.$('[data-cy=input-rok]', form)).should('have.class', 'border-negative-700')
          })
        })

        it('3. Filling out "Type of tax return" step.', () => {
          cy.dataCy('form-container').then((form) => {
            if (this.fileData.druhPriznania.druh === 'priznanie') {
              cy.wrap(Cypress.$('[data-cy=radio-group-vyberte-druh-priznania]', form)).find(`[data-cy=radio-priznanie]`).click()
            } else if (this.fileData.druhPriznania.druh === 'ciastkovePriznanie') {
              cy.wrap(Cypress.$('[data-cy=radio-group-vyberte-druh-priznania]', form)).find(`[data-cy=radio-čiastkové-priznanie]`).click()
            } else if (this.fileData.druhPriznania.druh === 'ciastkovePriznanieNaZanikDanovejPovinnosti') {
              cy.wrap(Cypress.$('[data-cy=radio-group-vyberte-druh-priznania]', form)).find(`[data-cy=radio-čiastkové-priznanie-na-zánik-daňovej-povinnosti]`).click()
            } else if (this.fileData.druhPriznania.druh === 'opravnePriznanie') {
              cy.wrap(Cypress.$('[data-cy=radio-group-vyberte-druh-priznania]', form)).find(`[data-cy=radio-opravné-priznanie]`).click()
            } else if (this.fileData.druhPriznania.druh === 'dodatocnePriznanie') {
              cy.wrap(Cypress.$('[data-cy=radio-dodatočné-priznanie]', form)).find(`[data-cy=radio-opravné-priznanie]`).click()
            }
            
            cy.wrap(Cypress.$('[data-cy=input-rok]', form)).type(this.fileData.druhPriznania.rok)
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('4. Checking "Taxpayer data" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.checkActiveStep(2)
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

            cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 13)     
            cy.wrap(Cypress.$(taxpayerBorderFields, form)).should('have.class', 'border-negative-700')
          })
        })

        it('5. Filling out "Taxpayer data" step', () => {
          cy.dataCy('form-container').then((form) => {
            if (this.fileData.udajeODanovnikovi.voSvojomMene) {
              cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-k-dani-z-nehnuteľností-vo-svojom-mene]', form)).find(`[data-cy=radio-áno]`).click()
            } else {
              cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-k-dani-z-nehnuteľností-vo-svojom-mene]', form)).find(`[data-cy=radio-nie]`).click()
            }

            if (this.fileData.udajeODanovnikovi.priznanieAko === 'fyzickaOsoba') {
              cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-ako]', form)).find(`[data-cy=radio-fyzická-osoba]`).click()
            } else if (this.fileData.udajeODanovnikovi.priznanieAko === 'fyzickaOsobaPodnikatel') {
              cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-ako]', form)).find(`[data-cy=radio-fyzická-osoba-podnikateľ]`).click()
            } else if (this.fileData.udajeODanovnikovi.priznanieAko === 'pravnickaOsoba') {
              cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-ako]', form)).find(`[data-cy=radio-právnicka-osoba]`).click()
            }
            
            cy.wrap(Cypress.$('[data-cy=input-rodneCislo]', form)).type(this.fileData.udajeODanovnikovi.rodneCislo)
            cy.wrap(Cypress.$('[data-cy=input-priezvisko]', form)).type(this.fileData.udajeODanovnikovi.priezvisko)
            cy.wrap(Cypress.$('[data-cy=input-meno]', form)).type(this.fileData.udajeODanovnikovi.menoTitul.meno)
            cy.wrap(Cypress.$('[data-cy=input-ulica]', form)).type(this.fileData.udajeODanovnikovi.ulicaCisloFyzickaOsoba.ulica)
            cy.wrap(Cypress.$('[data-cy=input-cislo]', form)).type(this.fileData.udajeODanovnikovi.ulicaCisloFyzickaOsoba.cislo)
            cy.wrap(Cypress.$('[data-cy=input-obec]', form)).type(this.fileData.udajeODanovnikovi.obecPsc.obec)
            cy.wrap(Cypress.$('[data-cy=input-psc]', form)).type(this.fileData.udajeODanovnikovi.obecPsc.psc)

            if (this.fileData.udajeODanovnikovi.stat !== '703') {
              let state = esbsNationalityCiselnik.find((test) => {
                return test.Code === this.fileData.udajeODanovnikovi.stat
              })

              cy.wrap(Cypress.$('[data-cy=select-štát]', form)).click()
              cy.wrap(Cypress.$('[data-cy=select-štát]', form)).type(state.Name + "{enter}{enter}")
            }

            if (this.fileData.udajeODanovnikovi.korespondencnaAdresa.korespondencnaAdresaRovnaka) {
              cy.wrap(Cypress.$('[data-cy=radio-group-je-korešpondenčná-adresa-rovnáká-ako-adresa-trvalého-pobytu]', form)).find(`[data-cy=radio-áno]`).click()
            } else {
              cy.wrap(Cypress.$('[data-cy=radio-group-je-korešpondenčná-adresa-rovnáká-ako-adresa-trvalého-pobytu]', form)).find(`[data-cy=radio-nie]`).click()
            }

            cy.wrap(Cypress.$('[data-cy=input-email]', form)).type(this.fileData.udajeODanovnikovi.email)
            cy.wrap(Cypress.$('[data-cy=input-telefon]', form)).type(this.fileData.udajeODanovnikovi.telefon)
          })

          if (!this.fileData.udajeODanovnikovi.korespondencnaAdresa.korespondencnaAdresaRovnaka) {
            cy.dataCy(`fieldset-root_udajeODanovnikovi_korespondencnaAdresa`).within((fieldset) => {
              cy.wrap(Cypress.$(`[data-cy=input-ulica]`, fieldset)).type(this.fileData.udajeODanovnikovi.korespondencnaAdresa.ulicaCisloKorespondencnaAdresa.ulica)
              cy.wrap(Cypress.$(`[data-cy=input-cislo]`, fieldset)).type(this.fileData.udajeODanovnikovi.korespondencnaAdresa.ulicaCisloKorespondencnaAdresa.cislo)
              cy.wrap(Cypress.$(`[data-cy=input-obec]`, fieldset)).type(this.fileData.udajeODanovnikovi.korespondencnaAdresa.obecPsc.obec)
              cy.wrap(Cypress.$(`[data-cy=input-psc]`, fieldset)).type(this.fileData.udajeODanovnikovi.korespondencnaAdresa.obecPsc.psc)
            })
          }

          cy.dataCy('form-container').then((form) => {
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('6. Checking "Land tax return" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.checkActiveStep(3)
          })
          if (this.fileData.danZPozemkov.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
            })

            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 9)     
              cy.wrap(Cypress.$(landTaxBorderFields, form)).should('have.class', 'border-negative-700')
            })
          } else {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('7. Filling out "Land tax return" step.', () => {
          if (this.fileData.danZPozemkov.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              if (!this.fileData.danZPozemkov.kalkulackaWrapper.pouzitKalkulacku) {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-kalkulačka-výpočtu-výmery-pozemkov]', form)).find(`[data-cy=checkbox-true]`).click()
              }

              cy.get(this.fileData.danZPozemkov.priznania).each((dataPriznania, indexPriznania) => {
                if (indexPriznania > 0) {
                  cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(1)).click()
                }
                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZPozemkov.priznania[indexPriznania].pravnyVztah === 'vlastnik') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-vlastník]`).click()
                  } else if (this.fileData.danZPozemkov.priznania[indexPriznania].pravnyVztah === 'spravca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-správca]`).click()
                  } else if (this.fileData.danZPozemkov.priznania[indexPriznania].pravnyVztah === 'najomca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-nájomca]`).click()
                  } else if (this.fileData.danZPozemkov.priznania[indexPriznania].pravnyVztah === 'uzivatel') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-užívateľ]`).click()
                  }

                  if (this.fileData.danZPozemkov.priznania[indexPriznania].spoluvlastnictvo === 'somJedinyVlastnik') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-som-jediný-vlastník]`).click()
                  } else if (this.fileData.danZPozemkov.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-podielové-spoluvlastníctvo]`).click()
                  } else if (this.fileData.danZPozemkov.priznania[indexPriznania].spoluvlastnictvo === 'bezpodieloveSpoluvlastnictvoManzelov') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-bezpodielové-spoluvlastníctvo-manželov]`).click()
                  }

                  cy.get(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky).each((dataPozemky, indexPozemky) => {
                    if (indexPozemky > 0) {
                      cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                    }

                    cy.dataCy(`section-pozemky-${indexPozemky}`).within((pozemky) => {
                      cy.wrap(Cypress.$('[data-cy=input-cisloListuVlastnictva]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].cisloListuVlastnictva)

                      cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', pozemky)).click()
                      cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].kataster + "{enter}{enter}")

                      cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].parcelneCisloSposobVyuzitiaPozemku.cisloParcely)

                      cy.wrap(Cypress.$('[data-cy=select-druh-pozemku]', pozemky)).click()
                      cy.wrap(Cypress.$('[data-cy=select-druh-pozemku]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].druhPozemku + " – {enter}{enter}")

                      cy.wrap(Cypress.$('[data-cy=input-celkovaVymeraPozemku]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].celkovaVymeraPozemku)
                      cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[0].podielPriestoruNaSpolocnychCastiachAZariadeniachDomu)
                      cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', pozemky)).type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].spoluvlastnickyPodiel)
                    })
                  })
                })
              })

              cy.get(this.fileData.danZPozemkov.priznania).each((dataPriznania, indexPriznania) => {
                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  cy.get(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky).each((dataPozemky, indexPozemky) => {
                    cy.dataCy(`section-pozemky-${indexPozemky}`).within((pozemky) => {
                      cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', pozemky)).clear().type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[0].podielPriestoruNaSpolocnychCastiachAZariadeniachDomu)
                      cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', pozemky)).clear().type(this.fileData.danZPozemkov.priznania[indexPriznania].pozemky[indexPozemky].spoluvlastnickyPodiel)
                    })
                  })
                })
              })
              
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('8. Checking "Construction tax return - one purpose" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.checkActiveStep(4)
          })
          if (this.fileData.danZoStaviebJedenUcel.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
            })

            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 12)     
              cy.wrap(Cypress.$(onePurposeTaxBorderFields, form)).should('have.class', 'border-negative-700')
            })
          } else {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('9. Filling out "Construction tax return - one purpose" step.', () => { 
          if (this.fileData.danZoStaviebJedenUcel.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              if (!this.fileData.danZoStaviebJedenUcel.kalkulackaWrapper.pouzitKalkulacku) {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-kalkulačka-výpočtu-výmery-pozemkov]', form)).find(`[data-cy=checkbox-true]`).click()
              }

              cy.get(this.fileData.danZoStaviebJedenUcel.priznania).each((dataPriznania, indexPriznania) => {
                if (indexPriznania > 0) {
                  cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                }
                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  cy.wrap(Cypress.$('[data-cy=input-ulicaACisloDomu]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].riadok1.ulicaACisloDomu)
                  cy.wrap(Cypress.$('[data-cy=input-supisneCislo]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].riadok1.supisneCislo)
                  cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', priznania)).click()
                  cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].riadok2.kataster + "{enter}{enter}")
                  cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].riadok2.cisloParcely)

                  if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].pravnyVztah === 'vlastnik') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-vlastník]`).click()
                  } else if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].pravnyVztah === 'spravca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-správca]`).click()
                  } else if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].pravnyVztah === 'najomca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-nájomca]`).click()
                  } else if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].pravnyVztah === 'uzivatel') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-užívateľ]`).click()
                  }

                  if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].spoluvlastnictvo === 'somJedinyVlastnik') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-som-jediný-vlastník]`).click()
                  } else if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-podielové-spoluvlastníctvo]`).click()
                  } else if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].spoluvlastnictvo === 'bezpodieloveSpoluvlastnictvoManzelov') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-bezpodielové-spoluvlastníctvo-manželov]`).click()
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  cy.wrap(Cypress.$('[data-cy=select-predmet-dane]', priznania)).click()
                  
                  cy.wrap(Cypress.$('[data-cy=select-predmet-dane]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].predmetDane + ") {enter}{enter}")

                  cy.wrap(Cypress.$('[data-cy=input-celkovaZastavanaPlocha]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].celkovaZastavanaPlocha)
                  cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].spoluvlastnickyPodiel + "{enter}")
                  cy.wrap(Cypress.$('[data-cy=input-pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia + "{enter}")

                  if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily) {
                    cy.wrap(Cypress.$(`[data-cy=radio-group-máte-časť-stavby-ktorá-podlieha-oslobodeniu-od-dane-zo-stavieb-podľa--17-zákona-č-5822004-zz-a-vzn]`, priznania)).find(`[data-cy=radio-áno]`).click()
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
                    cy.wrap(Cypress.$('[data-cy=input-pocetSpoluvlastnikov]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].pocetSpoluvlastnikov + "{enter}")

                    if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].naZakladeDohody) {
                      cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody]', priznania)).find(`[data-cy=radio-áno]`).click()
                    } else {
                      cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody]', priznania)).find(`[data-cy=radio-nie]`).click()
                    }
                  }

                  if (this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily) {
                    cy.wrap(Cypress.$('[data-cy=input-celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby)
                    cy.wrap(Cypress.$('[data-cy=input-vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb)
                  }
                })
              })

              cy.get(this.fileData.danZoStaviebJedenUcel.priznania).each((dataPriznania, indexPriznania) => {
                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(this.fileData.danZoStaviebJedenUcel.priznania[indexPriznania].riadok2.cisloParcely)
                })
              })
              
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
              //cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('10. Checking "Construction tax return - multi purpose" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.checkActiveStep(5)
          })
          if (this.fileData.danZoStaviebViacereUcely.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
            })

            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 14)     
              cy.wrap(Cypress.$(multiPurposeTaxBorderFields, form)).should('have.class', 'border-negative-700')
            })
          } else {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('11. Filling out "Construction tax return - multi purpose" step.', () => {
          if (this.fileData.danZoStaviebViacereUcely.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              if (!this.fileData.danZoStaviebViacereUcely.kalkulackaWrapper.pouzitKalkulacku) {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-kalkulačka-výpočtu-výmery-pozemkov]', form)).find(`[data-cy=checkbox-true]`).click()
              }

              cy.get(this.fileData.danZoStaviebViacereUcely.priznania).each((dataPriznania, indexPriznania) => {
                if (indexPriznania > 0) {
                  cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(1)).click()
                }
                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  cy.wrap(Cypress.$('[data-cy=input-ulicaACisloDomu]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].riadok1.ulicaACisloDomu)
                  cy.wrap(Cypress.$('[data-cy=input-supisneCislo]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].riadok1.supisneCislo)

                  cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', priznania)).click()
                  cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].riadok2.kataster + "{enter}{enter}")

                  cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].riadok2.cisloParcely)

                  if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].pravnyVztah === 'vlastnik') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-vlastník]`).click()
                  } else if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].pravnyVztah === 'spravca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-správca]`).click()
                  } else if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].pravnyVztah === 'najomca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-nájomca]`).click()
                  } else if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].pravnyVztah === 'uzivatel') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-užívateľ]`).click()
                  }

                  if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].spoluvlastnictvo === 'somJedinyVlastnik') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-som-jediný-vlastník]`).click()
                  } else if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-podielové-spoluvlastníctvo]`).click()
                  } else if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].spoluvlastnictvo === 'bezpodieloveSpoluvlastnictvoManzelov') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-bezpodielové-spoluvlastníctvo-manželov]`).click()
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
                    cy.wrap(Cypress.$('[data-cy=input-pocetSpoluvlastnikov]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].pocetSpoluvlastnikov)

                    if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].naZakladeDohody) {
                      cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody]', priznania)).find(`[data-cy=radio-áno]`).click()
                    } else {
                      cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody]', priznania)).find(`[data-cy=radio-nie]`).click()
                    }
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo' && this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].naZakladeDohody) {
                    cy.wrap(Cypress.$('[data-cy=file-input]', form)).attachFile('../files/test.pdf');
                  }

                  cy.wrap(Cypress.$('[data-cy=input-popisStavby]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].popisStavby)
                  cy.wrap(Cypress.$('[data-cy=input-celkovaVymera]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].celkovaVymera)
                  cy.wrap(Cypress.$('[data-cy=input-pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia)

                  if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily) {
                    cy.wrap(Cypress.$(`[data-cy=radio-group-máte-časť-stavby-ktorá-podlieha-oslobodeniu-od-dane-zo-stavieb-podľa--17-zákona-č-5822004-zz-a-vzn]`, priznania)).find(`[data-cy=radio-áno]`).click()
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].castStavbyOslobodenaOdDaneDetaily) {
                    cy.wrap(Cypress.$('[data-cy=input-celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby)
                    cy.wrap(Cypress.$('[data-cy=input-vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb)
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  cy.get(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].nehnutelnosti.nehnutelnosti).each((dataNehnutelnosti, indexNehnutelnosti) => {
                    if (indexNehnutelnosti > 0) {
                      cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                    }

                    cy.dataCy(`section-nehnutelnosti-${indexNehnutelnosti}`).within((nehnutelnosti) => {
                      cy.wrap(Cypress.$('[data-cy=select-účel-využitia-stavby]', nehnutelnosti)).click()
                      cy.wrap(Cypress.$('[data-cy=select-účel-využitia-stavby]', nehnutelnosti)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].nehnutelnosti.nehnutelnosti[indexNehnutelnosti].ucelVyuzitiaStavby + ") {enter}{enter}")

                      cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', nehnutelnosti)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].nehnutelnosti.nehnutelnosti[indexNehnutelnosti].podielPriestoruNaSpolocnychCastiachAZariadeniachDomu)

                      cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', nehnutelnosti)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].nehnutelnosti.nehnutelnosti[indexNehnutelnosti].spoluvlastnickyPodiel)
                    })
                  })
                })
              })

              if (this.fileData.danZoStaviebViacereUcely.vyplnitObject.vyplnit) {
                cy.get(this.fileData.danZoStaviebViacereUcely.priznania).each((dataPriznania, indexPriznania) => {
                  cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                    cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(this.fileData.danZoStaviebViacereUcely.priznania[indexPriznania].riadok2.cisloParcely)
                  })
                })
              }
              
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('12. Checking "Tax return - apartments and non residential" step validation.', () => {
          cy.dataCy('form-container').then((form) => {
            cy.checkActiveStep(6)
          })
          if (this.fileData.danZBytovANebytovychPriestorov.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-áno]', form)).click()
            })

            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()

              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 9)     
              cy.wrap(Cypress.$(nonResidentialTaxBorderFields, form)).should('have.class', 'border-negative-700')
            })
          } else {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$('[data-cy=radio-nie]', form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('13. Filling out "Tax return - apartments and non residential" step.', () => {
          if (this.fileData.danZBytovANebytovychPriestorov.vyplnitObject.vyplnit) {
            cy.dataCy('form-container').then((form) => {
              if (!this.fileData.danZBytovANebytovychPriestorov.kalkulackaWrapper.pouzitKalkulacku) {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-kalkulačka-výpočtu-výmery-podlahových-plôch-bytov-a-nebytových-priestorov]', form)).find(`[data-cy=checkbox-true]`).click()
              }

              cy.get(this.fileData.danZBytovANebytovychPriestorov.priznania).each((dataPriznania, indexPriznania) => {
                if (indexPriznania > 0) {
                  cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(1)).click()
                }
                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  cy.wrap(Cypress.$('[data-cy=input-ulicaACisloDomu]', priznania)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].riadok1.ulicaACisloDomu)
                  cy.wrap(Cypress.$('[data-cy=input-supisneCislo]', priznania)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].riadok1.supisneCislo)

                  cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', priznania)).click()
                  cy.wrap(Cypress.$('[data-cy=select-názov-katastrálneho-územia]', priznania)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].riadok2.kataster + "{enter}{enter}")
                  
                  cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).focus().clear()
                  cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].riadok2.cisloParcely)

                  if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].pravnyVztah === 'vlastnik') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-vlastník]`).click()
                  } else if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].pravnyVztah === 'spravca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-právny-vzťah]', priznania)).find(`[data-cy=radio-správca]`).click()
                  }

                  if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].spoluvlastnictvo === 'somJedinyVlastnik') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-som-jediný-vlastník]`).click()
                  } else if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-podielové-spoluvlastníctvo]`).click()
                  } else if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].spoluvlastnictvo === 'bezpodieloveSpoluvlastnictvoManzelov') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-spoluvlastníctvo]', priznania)).find(`[data-cy=radio-bezpodielové-spoluvlastníctvo-manželov]`).click()
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaByt.priznanieZaByt) {
                    cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-byt]', priznania)).find(`[data-cy=radio-áno]`).click()
                  } else if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].pravnyVztah === 'spravca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-byt]', priznania)).find(`[data-cy=radio-nie]`).click()
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaNebytovyPriestor.priznanieZaNebytovyPriestor) {
                    cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-nebytový-priestor-napr-garážové-státie-pivnica-obchodný-priestor-a-pod]', priznania)).find(`[data-cy=radio-áno]`).click()
                  } else if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].pravnyVztah === 'spravca') {
                    cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-nebytový-priestor-(napr.-garážové-státie,-pivnica,-obchodný-priestor-a-pod.)]', priznania)).find(`[data-cy=radio-nie]`).click()
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
                    cy.wrap(Cypress.$('[data-cy=input-pocetSpoluvlastnikov]', priznania)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].pocetSpoluvlastnikov + "{enter}")

                    if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].naZakladeDohody) {
                      cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody]', priznania)).find(`[data-cy=radio-áno]`).click()
                    } else {
                      cy.wrap(Cypress.$('[data-cy=radio-group-podávate-priznanie-za-všetkých-spoluvlastníkov-na-základe-dohody]', priznania)).find(`[data-cy=radio-nie]`).click()
                    }
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].spoluvlastnictvo === 'podieloveSpoluvlastnictvo' && this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].naZakladeDohody) {
                    cy.wrap(Cypress.$('[data-cy=file-input]', form)).attachFile('../files/test.pdf');
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaByt.priznanieZaByt) {
                    cy.wrap(Cypress.$('[data-cy=input-cisloBytu]', priznania)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaByt.cisloBytu)

                    cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', priznania)).eq(0).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaByt.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu)
                    cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', priznania)).eq(0).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaByt.spoluvlastnickyPodiel)
                  }
                })

                cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                  if (this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaNebytovyPriestor.priznanieZaNebytovyPriestor) {

                    cy.get(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaNebytovyPriestor.nebytovePriestory).each((dataProstory, indexProstory) => {
                      if (indexProstory > 0) {
                        cy.wrap(Cypress.$('[data-cy=add-button]', form).eq(0)).click()
                      }

                      cy.dataCy(`section-nebytovePriestory-${indexProstory}`).within((prostory) => {
                        cy.wrap(Cypress.$('[data-cy=input-podielPriestoruNaSpolocnychCastiachAZariadeniachDomu]', prostory)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaNebytovyPriestor.nebytovePriestory[indexProstory].podielPriestoruNaSpolocnychCastiachAZariadeniachDomu)
                        cy.wrap(Cypress.$('[data-cy=input-spoluvlastnickyPodiel]', prostory)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].priznanieZaNebytovyPriestor.nebytovePriestory[indexProstory].spoluvlastnickyPodiel)
                      })
                    })
                  }
                })
              })

              if (this.fileData.danZoStaviebViacereUcely.vyplnitObject.vyplnit) {
                cy.get(this.fileData.danZBytovANebytovychPriestorov.priznania).each((dataPriznania, indexPriznania) => {
                  cy.dataCy(`section-priznania-${indexPriznania}`).within((priznania) => {
                    cy.wrap(Cypress.$('[data-cy=input-cisloParcely]', priznania)).type(this.fileData.danZBytovANebytovychPriestorov.priznania[indexPriznania].riadok2.cisloParcely)
                  })
                })
              }
              
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('14. Checking "Husband/wife information" step validation.', () => {
          if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov) {
            cy.dataCy('form-container').then((form) => {
              cy.checkActiveStep(7)

              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
              cy.wrap(Cypress.$('[aria-required=true]', form)).should('have.length', 4)     
              cy.wrap(Cypress.$(husbandWifeBorderFields, form)).should('have.class', 'border-negative-700')
            })
          }
        })

        it('15. Filling out "Husband/wife information" step.', () => {
          if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov) {
            cy.dataCy('form-container').then((form) => {
              cy.wrap(Cypress.$(`[data-cy=input-rodneCislo]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.rodneCislo)
              cy.wrap(Cypress.$(`[data-cy=input-priezvisko]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.priezvisko)
              cy.wrap(Cypress.$(`[data-cy=input-meno]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.menoTitul.meno + "{enter}")
              if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov.rovnakaAdresa) {
                cy.wrap(Cypress.$('[data-cy=radio-group-má-trvalý-pobyt-na-rovnakej-adrese-ako-vy]', form)).find(`[data-cy=radio-áno]`).click()
              } else {
                cy.wrap(Cypress.$('[data-cy=radio-group-má-trvalý-pobyt-na-rovnakej-adrese-ako-vy]', form)).find(`[data-cy=radio-nie]`).click()
              }
            })

            cy.dataCy('form-container').then((form) => {
              if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov.rovnakaAdresa == false) {
                cy.wrap(Cypress.$(`[data-cy=input-ulica]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov.ulica)
                cy.wrap(Cypress.$(`[data-cy=input-cislo]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov.cislo)
                cy.wrap(Cypress.$(`[data-cy=input-obec]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.obecPsc.obec)
                cy.wrap(Cypress.$(`[data-cy=input-psc]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.obecPsc.psc) 
    
                if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov.stat !== '703') {
                  let state = esbsNationalityCiselnik.find((test) => {
                    return test.Code === this.fileData.bezpodieloveSpoluvlastnictvoManzelov.stat
                  })

                  cy.wrap(Cypress.$('[data-cy=select-štát]', form)).click()
                  cy.wrap(Cypress.$('[data-cy=select-štát]', form)).type(state.Name + "{enter}{enter}")
                }
              }

              cy.dataCy('form-container').then((form) => {
                cy.wrap(Cypress.$(`[data-cy=input-meno]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.menoTitul.meno)
                if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov.rovnakaAdresa == false) {
                  cy.wrap(Cypress.$(`[data-cy=input-psc]`, form)).type(this.fileData.bezpodieloveSpoluvlastnictvoManzelov.obecPsc.psc)
                }
              })

              cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
            })
          }
        })

        it('16. Filling out "Reduction or exemption from tax" step.', () => {
          cy.dataCy('form-container').then((form) => {
            if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov) {
              cy.checkActiveStep(8)
            } else {
              cy.checkActiveStep(7)
            }
            if (this.fileData.znizenieAleboOslobodenieOdDane.byty.length > 0) {
              this.fileData.znizenieAleboOslobodenieOdDane.byty.map((byt) => {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-byty]', form)).find(`[data-cy=checkbox-${byt}]`).click()
              })
            }
            if (this.fileData.znizenieAleboOslobodenieOdDane.stavby.length > 0) {
              this.fileData.znizenieAleboOslobodenieOdDane.stavby.map((stavba) => {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-stavby]', form)).find(`[data-cy=checkbox-${stavba}]`).click()
              })
            }
            if (this.fileData.znizenieAleboOslobodenieOdDane.pozemky.length > 0) {
              this.fileData.znizenieAleboOslobodenieOdDane.pozemky.map((pozemok) => {
                cy.wrap(Cypress.$('[data-cy=checkbox-group-pozemky]', form)).find(`[data-cy=checkbox-${pozemok}]`).click()
              })
            }

            cy.wrap(Cypress.$(`[data-cy=continue-button-${device}]`, form)).click()
          })
        })

        it('17. Check summary and download pdf.', () => {
          cy.dataCy('alert-container').should('not.exist')
          cy.dataCy('form-container').then((form) => {
            if (this.fileData.bezpodieloveSpoluvlastnictvoManzelov) {
              cy.checkActiveStep(9)
            } else {
              cy.checkActiveStep(8)
            }
         
            cy.wrap(Cypress.$(summaryBorderFields, form)).should('not.have.class', 'border-red-500');
            cy.wrap(Cypress.$(`[data-cy=download-pdf-button-${device}]`, form)).click()
          })
        })

        it('18. Check downloaded pdf.', () => {
          cy.readFile(path.join(Cypress.config("downloadsFolder"), "priznanie-k-dani-z-nehnutelnosti_output.pdf")).should("exist");
        })
      })
    })
})
