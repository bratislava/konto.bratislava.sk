// generated using quicktype.io from a few example JSONs - if a new format appears in the API please update accordingly
import * as z from 'zod'

export const DruhDokladuSchema = z.enum([
  'Cestovný pas',
  'Identifikačná karta cudzinca',
  'Občiansky preukaz',
  'Pobytový preukaz občana EÚ',
  'Povolenie na pobyt',
])
export type DruhDokladu = z.infer<typeof DruhDokladuSchema>

export const NarodnostSchema = z.enum(['nezist. neuved.', 'slovenská'])
export type Narodnost = z.infer<typeof NarodnostSchema>

export const TypPobytuMimoCiselnikSchema = z.enum(['Prechodný pobyt', 'Trvalý pobyt'])
export type TypPobytuMimoCiselnik = z.infer<typeof TypPobytuMimoCiselnikSchema>

export const PohlavieOsobySchema = z.enum(['mužské', 'ženské'])
export type PohlavieOsoby = z.infer<typeof PohlavieOsobySchema>

export const TypRodinnehoVztahuSchema = z.enum(['Manželstvo', 'Rodičovstvo'])
export type TypRodinnehoVztahu = z.infer<typeof TypRodinnehoVztahuSchema>

export const VztahRolaEjOsobySchema = z.enum(['Dieťa', 'Manžel', 'Manželka', 'Matka', 'Otec'])
export type VztahRolaEjOsoby = z.infer<typeof VztahRolaEjOsobySchema>

export const RodinnyStavSchema = z.enum([
  'rozvedený / rozvedená',
  'slobodný / slobodná',
  'ženatý / vydatá',
])
export type RodinnyStav = z.infer<typeof RodinnyStavSchema>

export const StatNarodeniaSchema = z.string()
export type StatNarodenia = z.infer<typeof StatNarodeniaSchema>

export const TypOsobySchema = z.enum([
  'Cudzinec prihlásený na pobyt v SR',
  'Občan s trvalým pobytom na území SR',
])
export type TypOsoby = z.infer<typeof TypOsobySchema>

export const TitulyOsobyElementSchema = z.object({
  hodnotaTituluKod: z.union([z.number(), z.null()]).optional(),
  hodnotaTitulu: z.union([z.null(), z.string()]).optional(),
  typTituluKod: z.union([z.number(), z.null()]).optional(),
  typTitulu: z.union([z.null(), z.string()]).optional(),
  datumZaciatkuPlatnosti: z.union([z.coerce.date(), z.null()]).optional(),
})
export type TitulyOsobyElement = z.infer<typeof TitulyOsobyElementSchema>

export const StatnePrislusnostiElementSchema = z.object({
  hodnotaKod: z.union([z.number(), z.null()]).optional(),
  hodnota: z.union([StatNarodeniaSchema, z.null()]).optional(),
})
export type StatnePrislusnostiElement = z.infer<typeof StatnePrislusnostiElementSchema>

export const RodnePriezviskaOsobyElementSchema = z.object({
  meno: z.union([z.null(), z.string()]).optional(),
  poradieRodnehoPriezviska: z.union([z.number(), z.null()]).optional(),
})
export type RodnePriezviskaOsobyElement = z.infer<typeof RodnePriezviskaOsobyElementSchema>

export const RodinniPrislusniciElementSchema = z.object({
  identifikatorVztahovejOsoby: z.union([z.null(), z.string()]).optional(),
  typRodinnehoVztahuKod: z.union([z.number(), z.null()]).optional(),
  typRodinnehoVztahu: z.union([TypRodinnehoVztahuSchema, z.null()]).optional(),
  datumVznikuVztahu: z.union([z.null(), z.string()]).optional(),
  miestoVydaniaSobasnehoListuKod: z.union([z.number(), z.null()]).optional(),
  miestoVydaniaSobasnehoListu: z.union([z.null(), z.string()]).optional(),
  vztahRolaVztahovejOsobyKod: z.union([z.number(), z.null()]).optional(),
  vztahRolaVztahovejOsoby: z.union([VztahRolaEjOsobySchema, z.null()]).optional(),
  vztahRolaPrimarnejOsobyKod: z.union([z.number(), z.null()]).optional(),
  vztahRolaPrimarnejOsoby: z.union([VztahRolaEjOsobySchema, z.null()]).optional(),
  sobasnaMatrikaKod: z.union([z.number(), z.null()]).optional(),
  sobasnaMatrika: z.union([z.null(), z.string()]).optional(),
})
export type RodinniPrislusniciElement = z.infer<typeof RodinniPrislusniciElementSchema>

export const PriezviskaOsobySchema = z.object({
  meno: z.union([z.null(), z.string()]).optional(),
  poradiePriezviska: z.union([z.number(), z.null()]).optional(),
})
export type PriezviskaOsoby = z.infer<typeof PriezviskaOsobySchema>

export const PobytyOsobySchema = z.object({
  typPobytu: z.union([z.number(), z.null()]).optional(),
  typPobytuMimoCiselnik: z.union([TypPobytuMimoCiselnikSchema, z.null()]).optional(),
  datumPrihlaseniaPobytu: z.union([z.null(), z.string()]).optional(),
  datumUkonceniaPobytu: z.union([z.null(), z.string()]).optional(),
  nazovObce: z.union([z.null(), z.string()]).optional(),
  supisneCislo: z.union([z.number(), z.null()]).optional(),
  nazovCastiObce: z.union([z.null(), z.string()]).optional(),
  nazovOkresu: z.union([z.null(), z.string()]).optional(),
  nazovUlice: z.union([z.null(), z.string()]).optional(),
  statMimoSr: z.null().optional(),
  nazovStatu: z.null().optional(),
  adresaMimoSr: z.null().optional(),
  okresMimoSr: z.null().optional(),
  obecMimoSr: z.null().optional(),
  castObceMimoSr: z.null().optional(),
  ulicaMimoSr: z.null().optional(),
  orientacneCisloMimoSr: z.null().optional(),
  supisneCisloMimoSr: z.null().optional(),
  urcenieMiestaVRamciBudovyMimoSr: z.null().optional(),
  pobytMimoSr: z.union([z.boolean(), z.null()]).optional(),
  indexDomu: z.union([z.null(), z.string()]).optional(),
  urcenieMiestaVRamciBudovy: z.union([z.null(), z.string()]).optional(),
  identifikatorAdresyRa: z.union([z.number(), z.null()]).optional(),
  vchodDomu: z.union([z.number(), z.null()]).optional(),
  dom: z.union([z.number(), z.null()]).optional(),
  ulica: z.union([z.number(), z.null()]).optional(),
  castObce: z.union([z.number(), z.null()]).optional(),
  obec: z.union([z.number(), z.null()]).optional(),
  okres: z.union([z.number(), z.null()]).optional(),
  orientacneCislo: z.union([z.number(), z.null()]).optional(),
})
export type PobytyOsoby = z.infer<typeof PobytyOsobySchema>

export const ObmedzeniaPravnejSposobilostiSchema = z.object({})
export type ObmedzeniaPravnejSposobilosti = z.infer<typeof ObmedzeniaPravnejSposobilostiSchema>

export const MenaOsobySchema = z.object({
  meno: z.union([z.null(), z.string()]).optional(),
  poradieMena: z.union([z.number(), z.null()]).optional(),
})
export type MenaOsoby = z.infer<typeof MenaOsobySchema>

export const DokladySchema = z.object({
  druhDokladuKod: z.union([z.number(), z.null()]).optional(),
  druhDokladu: z.union([DruhDokladuSchema, z.null()]).optional(),
  jednoznacnyIdentifikator: z.union([z.null(), z.string()]).optional(),
  udrzitela: z.union([z.boolean(), z.null()]).optional(),
})
export type Doklady = z.infer<typeof DokladySchema>

export const RfoIdentityListElementSchema = z.object({
  ifo: z.union([z.null(), z.string()]).optional(),
  rodneCislo: z.union([z.null(), z.string()]).optional(),
  datumNarodenia: z.union([z.null(), z.string()]).optional(),
  rokNarodenia: z.union([z.number(), z.null()]).optional(),
  miestoNarodeniaKod: z.union([z.number(), z.null()]).optional(),
  miestoNarodenia: z.union([z.null(), z.string()]).optional(),
  statNarodeniaKod: z.union([z.number(), z.null()]).optional(),
  statNarodenia: z.union([StatNarodeniaSchema, z.null()]).optional(),
  okresNarodeniaKod: z.union([z.number(), z.null()]).optional(),
  okresNarodenia: z.union([z.null(), z.string()]).optional(),
  rodnaMatrikaKod: z.null().optional(),
  rodnaMatrika: z.null().optional(),
  datumUmrtia: z.union([z.null(), z.string()]).optional(),
  miestoUmrtiaKod: z.null().optional(),
  miestoUmrtia: z.null().optional(),
  statUmrtiaKod: z.null().optional(),
  statUmrtia: z.null().optional(),
  okresUmrtiaKod: z.null().optional(),
  okresUmrtia: z.null().optional(),
  umrtnaMatrikaKod: z.null().optional(),
  umrtnaMatrika: z.null().optional(),
  pohlavieOsobyKod: z.union([z.number(), z.null()]).optional(),
  pohlavieOsoby: z.union([PohlavieOsobySchema, z.null()]).optional(),
  rodinnyStavKod: z.union([z.number(), z.null()]).optional(),
  rodinnyStav: z.union([RodinnyStavSchema, z.null()]).optional(),
  narodnostKod: z.null().optional(),
  narodnost: z.union([NarodnostSchema, z.null()]).optional(),
  stupenZverejneniaUdajovKod: z.union([z.number(), z.null()]).optional(),
  stupenZverejneniaUdajov: z.union([z.null(), z.string()]).optional(),
  typOsobyKod: z.union([z.number(), z.null()]).optional(),
  typOsoby: z.union([TypOsobySchema, z.null()]).optional(),
  menaOsoby: z.union([z.array(MenaOsobySchema), z.null()]).optional(),
  priezviskaOsoby: z.union([z.array(PriezviskaOsobySchema), z.null()]).optional(),
  rodnePriezviskaOsoby: z
    .union([
      z.array(RodnePriezviskaOsobyElementSchema),
      ObmedzeniaPravnejSposobilostiSchema,
      z.null(),
    ])
    .optional(),
  titulyOsoby: z
    .union([z.array(TitulyOsobyElementSchema), ObmedzeniaPravnejSposobilostiSchema, z.null()])
    .optional(),
  statnePrislusnosti: z
    .union([
      z.array(StatnePrislusnostiElementSchema),
      ObmedzeniaPravnejSposobilostiSchema,
      z.null(),
    ])
    .optional(),
  rodinniPrislusnici: z
    .union([
      z.array(RodinniPrislusniciElementSchema),
      ObmedzeniaPravnejSposobilostiSchema,
      z.null(),
    ])
    .optional(),
  pobytyOsoby: z.union([z.array(PobytyOsobySchema), z.null()]).optional(),
  zakazyPobytu: z.union([ObmedzeniaPravnejSposobilostiSchema, z.null()]).optional(),
  zruseniaVyhlaseniaOsobyZaMrtvu: z
    .union([ObmedzeniaPravnejSposobilostiSchema, z.null()])
    .optional(),
  doklady: z.union([z.array(DokladySchema), z.null()]).optional(),
  statneObcianstva: z.union([ObmedzeniaPravnejSposobilostiSchema, z.null()]).optional(),
  obmedzeniaPravnejSposobilosti: z
    .union([ObmedzeniaPravnejSposobilostiSchema, z.null()])
    .optional(),
  systemyModifikujuceUdajeOsoby: z
    .union([ObmedzeniaPravnejSposobilostiSchema, z.null()])
    .optional(),
  zaujmovaOsoba: z.union([z.boolean(), z.null()]).optional(),
})
export type RfoIdentityListElement = z.infer<typeof RfoIdentityListElementSchema>

// written manually
export const RfoIdentityListSchema = z.array(RfoIdentityListElementSchema)
export type RfoIdentityList = z.infer<typeof RfoIdentityListSchema>
