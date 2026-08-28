import { expect, type Page, test } from '@playwright/test'
import example1 from 'forms-shared/example-forms/examples/priznanieKDaniZNehnutelnostiExample1'
import example2 from 'forms-shared/example-forms/examples/priznanieKDaniZNehnutelnostiExample2'
import example3 from 'forms-shared/example-forms/examples/priznanieKDaniZNehnutelnostiExample3'
import example4 from 'forms-shared/example-forms/examples/priznanieKDaniZNehnutelnostiExample4'
import example5 from 'forms-shared/example-forms/examples/priznanieKDaniZNehnutelnostiExample5'
import example5NoCalculators from 'forms-shared/example-forms/examples/priznanieKDaniZNehnutelnostiExample5NoCalculators'
import type { TaxFormData } from 'forms-shared/tax-form/types'

import { openForm } from '../../pages/FormPage'
import {
  attachFiles,
  continueTo,
  expectStepRejected,
  expectSummaryRow,
  expectSummaryWithoutErrors,
  field,
  fillIn,
  pickDate,
  pickRadio,
  pickSelect,
  setCheckbox,
} from './helpers'

/**
 * Legacy port of `tests/cypress/e2e/form/formRealEstateTaxReturn.cy.ts` (F05) — 864 lines and 18
 * chained `it`s per scenario.
 *
 * Hand-written on purpose: explicit ids, explicit step order, explicit `if`s for the branches. The
 * branching is the honest cost of covering six scenarios by hand, and it is what the Cypress custom
 * commands (`useCalculator`, `fillOwner`, `selectLegalRelationship`, …) were hiding.
 *
 * Values come from the `forms-shared` examples, so they are typed as `TaxFormData` and there is no
 * re-encoded JSON fixture — the five files in `tests/cypress/fixtures/formRealEstateTaxReturn/` were
 * byte-for-byte copies of these.
 *
 * What made this tractable: all six examples are `priznanieAko: 'fyzickaOsoba'` with
 * `voSvojomMene: true`, so the taxpayer step is identical everywhere.
 */

const SLUG = 'priznanie-k-dani-z-nehnutelnosti'

/**
 * Option labels for the code-prefixed selects, hardcoded for exactly the codes the examples use.
 *
 * react-select has to be driven by the visible label and these labels carry a code prefix and an
 * en dash. The Cypress spec worked around that by appending separators (`druhPozemku + ' – '`) to
 * force a substring match; spelling the labels out is both shorter and exact.
 */
const DRUH_POZEMKU: Record<string, string> = {
  B: 'B – trvalé trávnaté porasty',
  C: 'C – záhrady',
  E: 'E – rybníky s chovom rýb a ostatné hospodársky využívané vodné plochy',
  F: 'F – zastavané plochy a nádvoria',
}
const PREDMET_DANE: Record<string, string> = {
  a: 'a) stavby na bývanie a drobné stavby, ktoré majú doplnkovú funkciu pre hlavnú stavbu',
}
const UCEL_VYUZITIA_STAVBY: Record<string, string> = {
  b: 'b) stavby na pôdohospodársku produkciu, skleníky, stavby pre vodné hospodárstvo, stavby využívané na skladovanie vlastnej pôdohospodárskej produkcie vrátane stavieb na vlastnú administratívu',
}
const STAT: Record<string, string> = {
  '686': 'Senegalská republika',
  '703': 'Slovenská republika',
}

/** `kataster` options are `value === label`, so the raw value can be used directly. */
const katasterLabel = (value: string) => value

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

/** Clicks a nested array's own add button until it holds `count` items. */
const ensureItems = async (page: Page, arrayId: string, itemProperty: string, count: number) => {
  const root = field(page, arrayId)
  const items = root.locator(`[data-cy^="section-${itemProperty}-"]`)

  // Required arrays arrive pre-populated (`arrayMinItems: 'requiredOnly'`), so this usually does
  // nothing. Items render before the array's own add button, hence `.last()`.
  for (let current = await items.count(); current < count; current += 1) {
    await root.locator('[data-cy=add-button]').last().click()
    await expect(items).toHaveCount(current + 1)
  }
}

const fillDatumy = async (page: Page, prefix: string, datumy: Any) => {
  if (datumy?.datumVznikuDanovejPovinnosti) {
    await pickDate(
      page,
      `${prefix}_datumVznikuDanovejPovinnosti`,
      datumy.datumVznikuDanovejPovinnosti,
    )
  }
  if (datumy?.datumZanikuDanovejPovinnosti) {
    await pickDate(
      page,
      `${prefix}_datumZanikuDanovejPovinnosti`,
      datumy.datumZanikuDanovejPovinnosti,
    )
  }
}

/** The co-ownership block shared by all four tax steps (`pravnyVztahSpoluvlastnictvo.ts`). */
const fillSpoluvlastnictvo = async (page: Page, prefix: string, priznanie: Any) => {
  await pickRadio(page, `${prefix}_pravnyVztah`, priznanie.pravnyVztah)
  await pickRadio(page, `${prefix}_spoluvlastnictvo`, priznanie.spoluvlastnictvo)

  if (priznanie.spoluvlastnictvo === 'podieloveSpoluvlastnictvo') {
    await fillIn(page, `${prefix}_pocetSpoluvlastnikov`, priznanie.pocetSpoluvlastnikov)
    await pickRadio(page, `${prefix}_naZakladeDohody`, priznanie.naZakladeDohody)

    // The upload only appears when the declaration is filed on behalf of all co-owners, and the
    // examples leave the array empty — so there is nothing to attach.
    if (priznanie.naZakladeDohody && priznanie.splnomocnenie?.length) {
      await attachFiles(page, `${prefix}_splnomocnenie`, ['splnomocnenie.pdf'])
    }
  }
}

/** The land-registry header shared by the three building steps (`stavbyBase.ts`). */
const fillStavbaBase = async (page: Page, prefix: string, priznanie: Any) => {
  if (priznanie.cisloListuVlastnictva) {
    await fillIn(page, `${prefix}_cisloListuVlastnictva`, priznanie.cisloListuVlastnictva)
  }
  await fillIn(page, `${prefix}_riadok1_ulicaACisloDomu`, priznanie.riadok1.ulicaACisloDomu)
  await fillIn(page, `${prefix}_riadok1_supisneCislo`, priznanie.riadok1.supisneCislo)
  await pickSelect(page, `${prefix}_riadok2_kataster`, katasterLabel(priznanie.riadok2.kataster))
  await fillIn(page, `${prefix}_riadok2_cisloParcely`, priznanie.riadok2.cisloParcely)
}

const fillDruhPriznania = async (page: Page, data: TaxFormData) => {
  await pickRadio(page, 'root_druhPriznania_druh', data.druhPriznania!.druh!)
  await fillIn(page, 'root_druhPriznania_rok', data.druhPriznania!.rok!)
  await continueTo(page, 'udaje-o-danovnikovi')
}

const fillUdajeODanovnikovi = async (page: Page, data: TaxFormData) => {
  const d = data.udajeODanovnikovi as Any

  await pickRadio(page, 'root_udajeODanovnikovi_voSvojomMene', d.voSvojomMene)
  await pickRadio(page, 'root_udajeODanovnikovi_priznanieAko', d.priznanieAko)

  await fillIn(page, 'root_udajeODanovnikovi_rodneCislo', d.rodneCislo)
  await fillIn(page, 'root_udajeODanovnikovi_priezvisko', d.priezvisko)
  await fillIn(page, 'root_udajeODanovnikovi_menoTitul_meno', d.menoTitul.meno)
  if (d.menoTitul.titul) {
    await fillIn(page, 'root_udajeODanovnikovi_menoTitul_titul', d.menoTitul.titul)
  }
  await fillIn(
    page,
    'root_udajeODanovnikovi_ulicaCisloFyzickaOsoba_ulica',
    d.ulicaCisloFyzickaOsoba.ulica,
  )
  await fillIn(
    page,
    'root_udajeODanovnikovi_ulicaCisloFyzickaOsoba_cislo',
    d.ulicaCisloFyzickaOsoba.cislo,
  )
  await fillIn(page, 'root_udajeODanovnikovi_obecPsc_obec', d.obecPsc.obec)
  await fillIn(page, 'root_udajeODanovnikovi_obecPsc_psc', d.obecPsc.psc)

  // Slovakia is the default, so only a different country needs an interaction.
  if (d.stat !== '703') {
    await pickSelect(page, 'root_udajeODanovnikovi_stat', STAT[d.stat])
  }

  const korespondencna = d.korespondencnaAdresa
  await pickRadio(
    page,
    'root_udajeODanovnikovi_korespondencnaAdresa_korespondencnaAdresaRovnaka',
    korespondencna.korespondencnaAdresaRovnaka,
  )
  if (!korespondencna.korespondencnaAdresaRovnaka) {
    const prefix = 'root_udajeODanovnikovi_korespondencnaAdresa'
    await fillIn(
      page,
      `${prefix}_ulicaCisloKorespondencnaAdresa_ulica`,
      korespondencna.ulicaCisloKorespondencnaAdresa.ulica,
    )
    await fillIn(
      page,
      `${prefix}_ulicaCisloKorespondencnaAdresa_cislo`,
      korespondencna.ulicaCisloKorespondencnaAdresa.cislo,
    )
    await fillIn(page, `${prefix}_obecPsc_obec`, korespondencna.obecPsc.obec)
    await fillIn(page, `${prefix}_obecPsc_psc`, korespondencna.obecPsc.psc)
    if (korespondencna.stat !== '703') {
      await pickSelect(page, `${prefix}_stat`, STAT[korespondencna.stat])
    }
  }

  if (d.email) await fillIn(page, 'root_udajeODanovnikovi_email', d.email)
  if (d.telefon) await fillIn(page, 'root_udajeODanovnikovi_telefon', d.telefon)

  await continueTo(page, 'dan-z-pozemkov')
}

/**
 * Answers a tax step's yes/no gate. Returns whether the step body needs filling.
 *
 * The gate defaults to "Nie", which *satisfies* the step's only requirement — so a step answered
 * "Nie" legitimately advances and there is no negative check to make for it.
 */
const answerGate = async (page: Page, step: string, vyplnit: boolean) => {
  await pickRadio(page, `root_${step}_vyplnitObject_vyplnit`, vyplnit)

  return vyplnit
}

const fillDanZPozemkov = async (page: Page, data: TaxFormData) => {
  const step = data.danZPozemkov as Any
  const nextKrok = 'dan-zo-stavieb-stavba-sluziaca-na-jeden-ucel'

  if (!(await answerGate(page, 'danZPozemkov', Boolean(step?.vyplnitObject?.vyplnit)))) {
    await continueTo(page, nextKrok)
    return
  }

  const kalkulacka = Boolean(step.kalkulackaWrapper.pouzitKalkulacku)
  await setCheckbox(page, 'root_danZPozemkov_kalkulackaWrapper_pouzitKalkulacku', kalkulacka)

  await ensureItems(page, 'root_danZPozemkov_priznania', 'priznania', step.priznania.length)

  for (const [i, priznanie] of step.priznania.entries()) {
    const p = `root_danZPozemkov_priznania_${i}`
    await fillSpoluvlastnictvo(page, p, priznanie)
    await ensureItems(page, `${p}_pozemky`, 'pozemky', priznanie.pozemky.length)

    for (const [j, pozemok] of priznanie.pozemky.entries()) {
      const z = `${p}_pozemky_${j}`

      if (pozemok.cisloListuVlastnictva) {
        await fillIn(page, `${z}_cisloListuVlastnictva`, pozemok.cisloListuVlastnictva)
      }
      await pickSelect(page, `${z}_kataster`, katasterLabel(pozemok.kataster))
      await fillIn(
        page,
        `${z}_parcelneCisloSposobVyuzitiaPozemku_cisloParcely`,
        pozemok.parcelneCisloSposobVyuzitiaPozemku.cisloParcely,
      )
      if (pozemok.parcelneCisloSposobVyuzitiaPozemku.sposobVyuzitiaPozemku) {
        await fillIn(
          page,
          `${z}_parcelneCisloSposobVyuzitiaPozemku_sposobVyuzitiaPozemku`,
          pozemok.parcelneCisloSposobVyuzitiaPozemku.sposobVyuzitiaPozemku,
        )
      }
      await pickSelect(page, `${z}_druhPozemku`, DRUH_POZEMKU[pozemok.druhPozemku])

      if (kalkulacka) {
        await fillIn(page, `${z}_celkovaVymeraPozemku`, pozemok.celkovaVymeraPozemku)
        await fillIn(
          page,
          `${z}_podielPriestoruNaSpolocnychCastiachAZariadeniachDomu`,
          pozemok.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
        )
        await fillIn(page, `${z}_spoluvlastnickyPodiel`, pozemok.spoluvlastnickyPodiel)
      } else {
        await fillIn(page, `${z}_vymeraPozemku`, pozemok.vymeraPozemku)
      }

      await fillDatumy(page, `${z}_datumy`, pozemok.datumy)
    }

    if (priznanie.poznamka) await fillIn(page, `${p}_poznamka`, priznanie.poznamka)
  }

  await continueTo(page, nextKrok)
}

const fillDanZoStaviebJedenUcel = async (page: Page, data: TaxFormData) => {
  const step = data.danZoStaviebJedenUcel as Any
  const nextKrok = 'dan-zo-stavieb-stavba-sluziaca-na-viacere-ucely'

  if (!(await answerGate(page, 'danZoStaviebJedenUcel', Boolean(step?.vyplnitObject?.vyplnit)))) {
    await continueTo(page, nextKrok)
    return
  }

  const kalkulacka = Boolean(step.kalkulackaWrapper.pouzitKalkulacku)
  await setCheckbox(
    page,
    'root_danZoStaviebJedenUcel_kalkulackaWrapper_pouzitKalkulacku',
    kalkulacka,
  )
  await ensureItems(
    page,
    'root_danZoStaviebJedenUcel_priznania',
    'priznania',
    step.priznania.length,
  )

  for (const [i, priznanie] of step.priznania.entries()) {
    const p = `root_danZoStaviebJedenUcel_priznania_${i}`

    await fillStavbaBase(page, p, priznanie)
    await fillSpoluvlastnictvo(page, p, priznanie)
    await pickSelect(page, `${p}_predmetDane`, PREDMET_DANE[priznanie.predmetDane])

    if (kalkulacka) {
      await fillIn(page, `${p}_celkovaZastavanaPlocha`, priznanie.celkovaZastavanaPlocha)
      await fillIn(page, `${p}_spoluvlastnickyPodiel`, priznanie.spoluvlastnickyPodiel)
    } else {
      await fillIn(page, `${p}_zakladDane`, priznanie.zakladDane)
    }

    await fillIn(
      page,
      `${p}_pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia`,
      priznanie.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
    )

    await pickRadio(
      page,
      `${p}_castStavbyOslobodenaOdDane`,
      Boolean(priznanie.castStavbyOslobodenaOdDane),
    )
    if (priznanie.castStavbyOslobodenaOdDane) {
      const detaily = priznanie.castStavbyOslobodenaOdDaneDetaily
      await fillIn(
        page,
        `${p}_castStavbyOslobodenaOdDaneDetaily_celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby`,
        detaily.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby,
      )
      await fillIn(
        page,
        `${p}_castStavbyOslobodenaOdDaneDetaily_vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb`,
        detaily.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
      )
    }

    await fillDatumy(page, `${p}_datumy`, priznanie.datumy)
    if (priznanie.poznamka) await fillIn(page, `${p}_poznamka`, priznanie.poznamka)
  }

  await continueTo(page, nextKrok)
}

const fillDanZoStaviebViacereUcely = async (page: Page, data: TaxFormData) => {
  const step = data.danZoStaviebViacereUcely as Any
  const nextKrok = 'dan-z-bytov-a-z-nebytovych-priestorov-v-bytovom-dome'

  if (
    !(await answerGate(page, 'danZoStaviebViacereUcely', Boolean(step?.vyplnitObject?.vyplnit)))
  ) {
    await continueTo(page, nextKrok)
    return
  }

  const kalkulacka = Boolean(step.kalkulackaWrapper.pouzitKalkulacku)
  await setCheckbox(
    page,
    'root_danZoStaviebViacereUcely_kalkulackaWrapper_pouzitKalkulacku',
    kalkulacka,
  )
  await ensureItems(
    page,
    'root_danZoStaviebViacereUcely_priznania',
    'priznania',
    step.priznania.length,
  )

  for (const [i, priznanie] of step.priznania.entries()) {
    const p = `root_danZoStaviebViacereUcely_priznania_${i}`

    await fillStavbaBase(page, p, priznanie)
    await fillSpoluvlastnictvo(page, p, priznanie)
    await fillIn(page, `${p}_popisStavby`, priznanie.popisStavby)
    await fillDatumy(page, `${p}_datumy`, priznanie.datumy)
    await fillIn(page, `${p}_celkovaVymera`, priznanie.celkovaVymera)
    await fillIn(
      page,
      `${p}_pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia`,
      priznanie.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
    )

    await pickRadio(
      page,
      `${p}_castStavbyOslobodenaOdDane`,
      Boolean(priznanie.castStavbyOslobodenaOdDane),
    )
    if (priznanie.castStavbyOslobodenaOdDane) {
      // Flat here, unlike the one-purpose step where the same field sits inside
      // `castStavbyOslobodenaOdDaneDetaily`.
      await fillIn(
        page,
        `${p}_vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb`,
        priznanie.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
      )
    }

    // Doubled key: an object `nehnutelnosti` containing an array `nehnutelnosti`.
    const list = priznanie.nehnutelnosti.nehnutelnosti
    await ensureItems(page, `${p}_nehnutelnosti_nehnutelnosti`, 'nehnutelnosti', list.length)

    for (const [j, nehnutelnost] of list.entries()) {
      const n = `${p}_nehnutelnosti_nehnutelnosti_${j}`
      await pickSelect(
        page,
        `${n}_ucelVyuzitiaStavby`,
        UCEL_VYUZITIA_STAVBY[nehnutelnost.ucelVyuzitiaStavby],
      )

      if (kalkulacka) {
        await fillIn(
          page,
          `${n}_podielPriestoruNaSpolocnychCastiachAZariadeniachDomu`,
          nehnutelnost.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
        )
        await fillIn(page, `${n}_spoluvlastnickyPodiel`, nehnutelnost.spoluvlastnickyPodiel)
      } else {
        await fillIn(page, `${n}_vymeraPodlahovejPlochy`, nehnutelnost.vymeraPodlahovejPlochy)
      }
    }

    if (!kalkulacka) {
      const sumar = priznanie.nehnutelnosti.sumar
      await fillIn(
        page,
        `${p}_nehnutelnosti_sumar_vymeraPodlahovychPloch`,
        sumar.vymeraPodlahovychPloch,
      )
      await fillIn(page, `${p}_nehnutelnosti_sumar_zakladDane`, sumar.zakladDane)
    }

    if (priznanie.poznamka) await fillIn(page, `${p}_poznamka`, priznanie.poznamka)
  }

  await continueTo(page, nextKrok)
}

const fillDanZBytov = async (page: Page, data: TaxFormData, nextKrok: string) => {
  const step = data.danZBytovANebytovychPriestorov as Any

  if (
    !(await answerGate(
      page,
      'danZBytovANebytovychPriestorov',
      Boolean(step?.vyplnitObject?.vyplnit),
    ))
  ) {
    await continueTo(page, nextKrok)
    return
  }

  const kalkulacka = Boolean(step.kalkulackaWrapper.pouzitKalkulacku)
  await setCheckbox(
    page,
    'root_danZBytovANebytovychPriestorov_kalkulackaWrapper_pouzitKalkulacku',
    kalkulacka,
  )
  await ensureItems(
    page,
    'root_danZBytovANebytovychPriestorov_priznania',
    'priznania',
    step.priznania.length,
  )

  for (const [i, priznanie] of step.priznania.entries()) {
    const p = `root_danZBytovANebytovychPriestorov_priznania_${i}`

    await fillStavbaBase(page, p, priznanie)
    await fillSpoluvlastnictvo(page, p, priznanie)

    // Doubled keys again: `priznanieZaByt.priznanieZaByt`, `priznanieZaNebytovyPriestor.…`.
    const byt = priznanie.priznanieZaByt
    await pickRadio(page, `${p}_priznanieZaByt_priznanieZaByt`, Boolean(byt.priznanieZaByt))
    if (byt.priznanieZaByt) {
      const b = `${p}_priznanieZaByt`
      await fillIn(page, `${b}_cisloBytu`, byt.cisloBytu)
      if (byt.popisBytu) await fillIn(page, `${b}_popisBytu`, byt.popisBytu)

      if (kalkulacka) {
        await fillIn(
          page,
          `${b}_podielPriestoruNaSpolocnychCastiachAZariadeniachDomu`,
          byt.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
        )
        await fillIn(page, `${b}_spoluvlastnickyPodiel`, byt.spoluvlastnickyPodiel)
      } else {
        await fillIn(page, `${b}_vymeraPodlahovejPlochyBytu`, byt.vymeraPodlahovejPlochyBytu)
      }

      if (byt.vymeraPodlahovejPlochyNaIneUcely != null) {
        await fillIn(
          page,
          `${b}_vymeraPodlahovejPlochyNaIneUcely`,
          byt.vymeraPodlahovejPlochyNaIneUcely,
        )
      }
      await fillDatumy(page, `${b}_datumy`, byt.datumy)
    }

    const nebytovy = priznanie.priznanieZaNebytovyPriestor
    await pickRadio(
      page,
      `${p}_priznanieZaNebytovyPriestor_priznanieZaNebytovyPriestor`,
      Boolean(nebytovy.priznanieZaNebytovyPriestor),
    )
    if (nebytovy.priznanieZaNebytovyPriestor) {
      const listId = `${p}_priznanieZaNebytovyPriestor_nebytovePriestory`
      await ensureItems(page, listId, 'nebytovePriestory', nebytovy.nebytovePriestory.length)

      for (const [j, priestor] of nebytovy.nebytovePriestory.entries()) {
        const q = `${listId}_${j}`
        await fillIn(
          page,
          `${q}_riadok_ucelVyuzitiaNebytovehoPriestoruVBytovomDome`,
          priestor.riadok.ucelVyuzitiaNebytovehoPriestoruVBytovomDome,
        )
        await fillIn(
          page,
          `${q}_riadok_cisloNebytovehoPriestoruVBytovomDome`,
          priestor.riadok.cisloNebytovehoPriestoruVBytovomDome,
        )

        if (kalkulacka) {
          await fillIn(
            page,
            `${q}_podielPriestoruNaSpolocnychCastiachAZariadeniachDomu`,
            priestor.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu,
          )
          await fillIn(page, `${q}_spoluvlastnickyPodiel`, priestor.spoluvlastnickyPodiel)
        } else {
          await fillIn(
            page,
            `${q}_vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome`,
            priestor.vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome,
          )
        }

        await fillDatumy(page, `${q}_datumy`, priestor.datumy)
      }
    }

    if (priznanie.poznamka) await fillIn(page, `${p}_poznamka`, priznanie.poznamka)
  }

  await continueTo(page, nextKrok)
}

const fillManzel = async (page: Page, data: TaxFormData) => {
  const m = data.bezpodieloveSpoluvlastnictvoManzelov as Any

  await fillIn(page, 'root_bezpodieloveSpoluvlastnictvoManzelov_rodneCislo', m.rodneCislo)
  await fillIn(page, 'root_bezpodieloveSpoluvlastnictvoManzelov_priezvisko', m.priezvisko)
  await fillIn(page, 'root_bezpodieloveSpoluvlastnictvoManzelov_menoTitul_meno', m.menoTitul.meno)
  if (m.menoTitul.titul) {
    await fillIn(
      page,
      'root_bezpodieloveSpoluvlastnictvoManzelov_menoTitul_titul',
      m.menoTitul.titul,
    )
  }

  await pickRadio(page, 'root_bezpodieloveSpoluvlastnictvoManzelov_rovnakaAdresa', m.rovnakaAdresa)
  if (!m.rovnakaAdresa) {
    const prefix = 'root_bezpodieloveSpoluvlastnictvoManzelov'
    await fillIn(
      page,
      `${prefix}_ulicaCisloBezpodieloveSpoluvlastnictvoManzelov_ulica`,
      m.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov.ulica,
    )
    await fillIn(
      page,
      `${prefix}_ulicaCisloBezpodieloveSpoluvlastnictvoManzelov_cislo`,
      m.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov.cislo,
    )
    await fillIn(page, `${prefix}_obecPsc_obec`, m.obecPsc.obec)
    await fillIn(page, `${prefix}_obecPsc_psc`, m.obecPsc.psc)
    if (m.stat !== '703') await pickSelect(page, `${prefix}_stat`, STAT[m.stat])
  }

  if (m.email) await fillIn(page, 'root_bezpodieloveSpoluvlastnictvoManzelov_email', m.email)
  if (m.telefon) await fillIn(page, 'root_bezpodieloveSpoluvlastnictvoManzelov_telefon', m.telefon)

  await continueTo(page, 'znizenie-alebo-oslobodenie-od-dane')
}

const fillZnizenie = async (page: Page, data: TaxFormData) => {
  const z = data.znizenieAleboOslobodenieOdDane as Any

  for (const group of ['pozemky', 'stavby', 'byty'] as const) {
    for (const option of z?.[group] ?? []) {
      await setCheckbox(page, `root_znizenieAleboOslobodenieOdDane_${group}`, true, option)
    }
  }

  await continueTo(page, 'sumar')
}

const EXAMPLES = [example1, example2, example3, example4, example5, example5NoCalculators]

EXAMPLES.forEach((example) => {
  test(`F05 — ${example.name}`, { tag: '@legacy' }, async ({ page }) => {
    const data = example.formData as TaxFormData

    await openForm(page, SLUG)

    await test.step('druh priznania — prázdny krok neprejde', async () => {
      // Only the year errors: `druh` already holds its default.
      await expectStepRejected(page, 'druh-priznania', ['root_druhPriznania_rok'])
    })

    await test.step('druh priznania', () => fillDruhPriznania(page, data))

    await test.step('údaje o daňovníkovi — prázdny krok neprejde', async () => {
      await expectStepRejected(page, 'udaje-o-danovnikovi', [
        'root_udajeODanovnikovi_rodneCislo',
        'root_udajeODanovnikovi_priezvisko',
        'root_udajeODanovnikovi_menoTitul_meno',
        'root_udajeODanovnikovi_ulicaCisloFyzickaOsoba_ulica',
        'root_udajeODanovnikovi_ulicaCisloFyzickaOsoba_cislo',
        'root_udajeODanovnikovi_obecPsc_obec',
        'root_udajeODanovnikovi_obecPsc_psc',
      ])
    })

    await test.step('údaje o daňovníkovi', () => fillUdajeODanovnikovi(page, data))

    // The four tax steps have no negative check to make: their gate defaults to "Nie", which
    // satisfies the only requirement, so an empty step legitimately advances.
    await test.step('daň z pozemkov', () => fillDanZPozemkov(page, data))
    await test.step('daň zo stavieb — jeden účel', () => fillDanZoStaviebJedenUcel(page, data))
    await test.step('daň zo stavieb — viaceré účely', () =>
      fillDanZoStaviebViacereUcely(page, data))

    const hasSpouse = Boolean(data.bezpodieloveSpoluvlastnictvoManzelov)
    await test.step('daň z bytov a nebytových priestorov', () =>
      fillDanZBytov(
        page,
        data,
        hasSpouse ? 'udaje-o-manzelovi-manzelke' : 'znizenie-alebo-oslobodenie-od-dane',
      ))

    if (hasSpouse) {
      await test.step('údaje o manželovi/manželke — prázdny krok neprejde', async () => {
        await expectStepRejected(page, 'udaje-o-manzelovi-manzelke', [
          'root_bezpodieloveSpoluvlastnictvoManzelov_rodneCislo',
          'root_bezpodieloveSpoluvlastnictvoManzelov_priezvisko',
          'root_bezpodieloveSpoluvlastnictvoManzelov_menoTitul_meno',
        ])
      })
      await test.step('údaje o manželovi/manželke', () => fillManzel(page, data))
    }

    // Nothing in this step is required, so it always advances.
    await test.step('zníženie alebo oslobodenie od dane', () => fillZnizenie(page, data))

    await test.step('sumár', async () => {
      await expectSummaryWithoutErrors(page)

      await expectSummaryRow(page, 'root_druhPriznania_rok', String(data.druhPriznania!.rok))
      await expectSummaryRow(
        page,
        'root_udajeODanovnikovi_rodneCislo',
        (data.udajeODanovnikovi as Any).rodneCislo,
      )
      await expectSummaryRow(
        page,
        'root_udajeODanovnikovi_priezvisko',
        (data.udajeODanovnikovi as Any).priezvisko,
      )
      if (hasSpouse) {
        await expectSummaryRow(
          page,
          'root_bezpodieloveSpoluvlastnictvoManzelov_rodneCislo',
          (data.bezpodieloveSpoluvlastnictvoManzelov as Any).rodneCislo,
        )
      }
    })
  })
})
