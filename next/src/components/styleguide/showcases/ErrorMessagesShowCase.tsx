import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { ReactNode } from 'react'

import { Wrapper } from '../Wrapper'

type ProposedMessage = {
  translationKey: string
  message: string
}

type ErrorMessageRow = {
  translationKey: string
  /** When the message shows up */
  trigger: string
  /** Components which render the message */
  sources?: string[]
  /**
   * Wording proposal for the product manager, `null` means the current wording is fine.
   * A list is used when one key should be split into several keys with their own wording.
   */
  proposed: string | ProposedMessage[] | null
  note?: ReactNode
}

type ErrorMessageSection = {
  title: string
  namespace: 'account' | 'rjsf-errors'
  description: ReactNode
  rows: ErrorMessageRow[]
}

const hookFormRows: ErrorMessageRow[] = [
  {
    translationKey: 'auth.fields.email_required',
    trigger: 'Prázdny e-mail',
    sources: [
      'LoginForm.tsx',
      'RegisterForm.tsx',
      'ForgottenPasswordForm.tsx',
      'EmailChangeForm.tsx',
      'UserProfileDetailsEdit.tsx',
    ],
    proposed: 'Zadajte e-mail.',
  },
  {
    translationKey: 'auth.fields.email_format',
    trigger: 'E-mail nemá platný tvar',
    sources: [
      'LoginForm.tsx',
      'RegisterForm.tsx',
      'ForgottenPasswordForm.tsx',
      'EmailChangeForm.tsx',
      'UserProfileDetailsEdit.tsx',
    ],
    proposed: 'Zadajte e-mail v tvare jan.novak@example.com.',
  },
  {
    translationKey: 'auth.fields.password_required',
    trigger: 'Prázdne heslo, v PasswordChangeForm.tsx aj prázdne staré heslo',
    sources: [
      'LoginForm.tsx',
      'RegisterForm.tsx',
      'NewPasswordForm.tsx',
      'EmailChangeForm.tsx',
      'PasswordChangeForm.tsx',
    ],
    proposed: 'Zadajte heslo.',
    note: 'Pole starého hesla má v schéme minLength: 2, takže sa táto správa zobrazí aj pri jednom zadanom znaku.',
  },
  {
    translationKey: 'auth.fields.password_format',
    trigger: 'Heslo nespĺňa požiadavky na dĺžku a znaky',
    sources: ['RegisterForm.tsx', 'NewPasswordForm.tsx', 'PasswordChangeForm.tsx'],
    proposed: 'Heslo musí mať aspoň 8 znakov a obsahovať veľké písmeno, malé písmeno a číslo.',
  },
  {
    translationKey: 'auth.fields.verification_code_required',
    trigger: 'Prázdny overovací kód',
    sources: ['EmailVerificationForm.tsx', 'NewPasswordForm.tsx'],
    proposed: 'Zadajte overovací kód, ktorý sme vám poslali e-mailom.',
  },
  {
    translationKey: 'auth.fields.verification_code_format',
    trigger: 'Overovací kód nemá 6 číslic',
    sources: ['EmailVerificationForm.tsx', 'NewPasswordForm.tsx'],
    proposed: 'Overovací kód musí mať 6 číslic.',
    note: 'Súčasné znenie („kód nie je správny“) mýli, nesprávny kód hlási až server v errors.CodeMismatchException.',
  },
  {
    translationKey: 'auth.fields.given_name_required',
    trigger: 'Prázdne meno',
    sources: [
      'RegisterForm.tsx',
      'IdentityVerificationOfPhysicalEntityForm.tsx',
      'UserProfileDetailsEdit.tsx',
    ],
    proposed: 'Zadajte meno.',
  },
  {
    translationKey: 'auth.fields.family_name_required',
    trigger: 'Prázdne priezvisko',
    sources: [
      'RegisterForm.tsx',
      'IdentityVerificationOfPhysicalEntityForm.tsx',
      'UserProfileDetailsEdit.tsx',
    ],
    proposed: 'Zadajte priezvisko.',
  },
  {
    translationKey: 'auth.fields.business_name_required',
    trigger: 'Prázdne obchodné meno pri právnickej osobe a fyzickej osobe – podnikateľovi',
    sources: ['RegisterForm.tsx'],
    proposed: 'Zadajte obchodné meno.',
  },
  {
    translationKey: 'auth.fields.rc_required',
    trigger: 'Prázdne rodné číslo',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: 'Zadajte rodné číslo v tvare 123456/7890.',
  },
  {
    translationKey: 'auth.fields.rc_format',
    trigger: 'Rodné číslo má nesprávnu dĺžku alebo kontrolný súčet',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: 'Rodné číslo zadajte v tvare 123456/7890.',
    note: 'Validácia prijme aj deväť číslic bez lomky, správa však lomku vyžaduje.',
  },
  {
    translationKey: 'auth.fields.id_card_required',
    trigger: 'Prázdne číslo dokladu totožnosti',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: 'Zadajte číslo dokladu totožnosti.',
    note: 'Súčasné znenie „Číslo je povinné.“ nepomenúva pole.',
  },
  {
    translationKey: 'auth.fields.id_card_format',
    trigger: 'Číslo dokladu nemá tvar dvoch písmen a šiestich až siedmich číslic',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: 'Číslo dokladu zadajte bez medzier v tvare AB123456.',
  },
  {
    translationKey: 'auth.fields.phone_number_format',
    trigger: 'Telefónne číslo nie je v medzinárodnom tvare',
    sources: ['PhoneNumberForm.tsx'],
    proposed: 'Telefónne číslo zadajte v medzinárodnom tvare, napríklad +421912345678.',
    note: 'Pole nie je povinné, správa pre prázdne pole neexistuje.',
  },
  {
    translationKey: 'towing.licensePlate_required',
    trigger: 'Prázdne evidenčné číslo vozidla',
    sources: ['Towing.tsx'],
    proposed: 'Zadajte evidenčné číslo vozidla bez medzier, napríklad BA123AB.',
  },
]

const rjsfExistingRows: ErrorMessageRow[] = [
  {
    translationKey: 'required',
    trigger: 'Prázdne povinné pole akéhokoľvek typu vo všetkých formulároch mestských služieb',
    sources: [
      'InputWidgetRJSF.tsx',
      'SelectWidgetRJSF.tsx',
      'RadioGroupWidgetRJSF.tsx',
      'CheckboxWidgetRJSF.tsx',
      'DatePickerWidgetRJSF.tsx',
      'TimePickerWidgetRJSF.tsx',
      'FileUploadWidgetRJSF.tsx',
    ],
    proposed: [
      { translationKey: 'required.input', message: 'Vyplňte pole.' },
      { translationKey: 'required.number', message: 'Zadajte číslo.' },
      { translationKey: 'required.select', message: 'Vyberte možnosť zo zoznamu.' },
      { translationKey: 'required.radio', message: 'Vyberte jednu z možností.' },
      { translationKey: 'required.checkbox', message: 'Označte pole.' },
      { translationKey: 'required.date', message: 'Zadajte dátum v tvare DD.MM.RRRR.' },
      { translationKey: 'required.time', message: 'Zadajte čas v tvare HH:MM.' },
      { translationKey: 'required.file', message: 'Nahrajte súbor.' },
      { translationKey: 'required.unknown', message: 'Vyplňte pole.' },
    ],
    note: (
      <>
        Jedna správa pre všetky typy polí. Rozdelenie podľa typu poľa vyžaduje čítanie widgetu z
        baUiSchema v <code>useFormErrorTranslations.ts</code>, kľúč required.unknown zostáva ako
        záloha.
      </>
    ),
  },
  {
    translationKey: 'minLength',
    trigger: 'Text kratší ako minLength',
    sources: ['InputWidgetRJSF.tsx', 'TextAreaWidgetRJSF.tsx'],
    proposed: [
      { translationKey: 'minLength_one', message: 'Zadajte aspoň {{count}} znak.' },
      { translationKey: 'minLength_few', message: 'Zadajte aspoň {{count}} znaky.' },
      { translationKey: 'minLength_other', message: 'Zadajte aspoň {{count}} znakov.' },
    ],
    note: (
      <>
        Slovenčina skloňuje počítaný predmet, preto sú potrebné tri tvary a volanie t() s parametrom
        count z AJV chyby (params.limit) v <code>useFormErrorTranslations.ts</code>.
      </>
    ),
  },
  {
    translationKey: 'minItems',
    trigger: 'Primalý počet vybraných možností alebo pridaných položiek',
    sources: [
      'CheckboxGroupWidgetRJSF.tsx',
      'SelectMultipleWidgetRJSF.tsx',
      'FileUploadMultipleWidgetRJSF.tsx',
      'BAArrayFieldTemplate.tsx',
    ],
    proposed: [
      { translationKey: 'minItems_one', message: 'Vyberte aspoň {{count}} možnosť.' },
      { translationKey: 'minItems_few', message: 'Vyberte aspoň {{count}} možnosti.' },
      { translationKey: 'minItems_other', message: 'Vyberte aspoň {{count}} možností.' },
    ],
    note: 'Pre polia položiek (arrayField) navrhujeme vlastné kľúče so znením „Pridajte aspoň {{count}} položku / položky / položiek.“',
  },
  {
    translationKey: 'pattern',
    trigger: 'Hodnota nesedí s regulárnym výrazom',
    sources: ['InputWidgetRJSF.tsx', 'TextAreaWidgetRJSF.tsx'],
    proposed: null,
    note: 'Generické znenie stačí ako záloha, vhodnejšie je znenie na úrovni poľa.',
  },
  {
    translationKey: 'format.email',
    trigger: 'E-mail nemá platný tvar',
    sources: ['InputWidgetRJSF.tsx'],
    proposed: 'Zadajte e-mail v tvare jan.novak@example.com.',
  },
  {
    translationKey: 'format.ba-iban',
    trigger: 'IBAN nemá platný tvar',
    sources: ['InputWidgetRJSF.tsx'],
    proposed: 'Zadajte IBAN v tvare SK89 0000 0000 0000 0000 0000.',
  },
  {
    translationKey: 'format.ba-phone-number',
    trigger: 'Telefónne číslo nie je v medzinárodnom tvare',
    sources: ['InputWidgetRJSF.tsx'],
    proposed: 'Zadajte telefónne číslo v medzinárodnom tvare, napríklad +421912345678.',
  },
  {
    translationKey: 'format.ba-zip',
    trigger: 'Nikdy, kľúč je mŕtvy – formát sa v schémach volá ba-slovak-zip',
    proposed:
      'Kľúč premenovať na format.ba-slovak-zip so znením „Zadajte PSČ v tvare 81101.“ Chyba PSČ dnes končí na format.unknown.',
  },
  {
    translationKey: 'format.unknown',
    trigger:
      'Formát bez vlastného kľúča – dnes PSČ, IČO, spoluvlastnícky podiel, dátum, čas, slovenské telefónne číslo a identifikátor prílohy',
    sources: [
      'InputWidgetRJSF.tsx',
      'DatePickerWidgetRJSF.tsx',
      'TimePickerWidgetRJSF.tsx',
      'FileUploadWidgetRJSF.tsx',
    ],
    proposed: null,
    note: 'Znenie je rovnaké ako pri chybe pattern, takže používateľ nevie, aký tvar hodnoty sa od neho čaká.',
  },
  {
    translationKey: 'unknown',
    trigger: 'Chyba bez názvu',
    proposed: null,
  },
]

const rjsfMissingRows: ErrorMessageRow[] = [
  {
    translationKey: 'const',
    trigger: 'Odznačené povinné zaškrtnutie, napríklad súhlas – 15 použití v schémach',
    sources: ['CheckboxWidgetRJSF.tsx'],
    proposed: 'Na pokračovanie označte toto pole.',
    note: 'Najvyššia priorita – jediná chýbajúca správa dosiahnuteľná bežným klikaním: súhlas označiť a znova odznačiť.',
  },
  {
    translationKey: 'maxItems',
    trigger: 'Prekročený počet vybraných možností alebo pridaných položiek – 3 použitia',
    sources: [
      'CheckboxGroupWidgetRJSF.tsx',
      'SelectMultipleWidgetRJSF.tsx',
      'BAArrayFieldTemplate.tsx',
    ],
    proposed: [
      { translationKey: 'maxItems_one', message: 'Vyberte najviac {{count}} možnosť.' },
      { translationKey: 'maxItems_few', message: 'Vyberte najviac {{count}} možnosti.' },
      { translationKey: 'maxItems_other', message: 'Vyberte najviac {{count}} možností.' },
    ],
  },
  {
    translationKey: 'minimum',
    trigger: 'Hodnota pod minimom – 42 použití v službách, najčastejšie minimum 0',
    sources: ['NumberWidgetRJSF.tsx'],
    proposed: 'Zadajte číslo {{limit}} alebo väčšie.',
    note: 'Pole dostáva minimum ako minValue a hodnotu samo upraví, chyba nastane len pri importe XML alebo JSON. Pri minimum 0 je vhodnejšie znenie „Zadajte nezáporné číslo.“',
  },
  {
    translationKey: 'maximum',
    trigger: 'Hodnota nad maximom – 4 použitia, napríklad rok priznania (2000 – 2099)',
    sources: ['NumberWidgetRJSF.tsx'],
    proposed: 'Zadajte číslo {{limit}} alebo menšie.',
    note: 'Pole dostáva maximum ako maxValue a hodnotu samo upraví, chyba nastane len pri importe XML alebo JSON.',
  },
  {
    translationKey: 'multipleOf',
    trigger: 'Hodnota mimo povoleného kroku – 11 použití',
    sources: ['NumberWidgetRJSF.tsx'],
    proposed: 'Zadajte hodnotu ako násobok {{limit}}.',
    note: 'Pole hodnotu samo zaokrúhli, chyba nastane len pri importe XML alebo JSON. Pri kroku 0,01 je vhodnejšie znenie „Zadajte hodnotu s najviac dvoma desatinnými miestami.“',
  },
  {
    translationKey: 'maxLength',
    trigger: 'Text dlhší ako maxLength',
    sources: ['InputWidgetRJSF.tsx', 'TextAreaWidgetRJSF.tsx'],
    proposed: [
      { translationKey: 'maxLength_one', message: 'Zadajte najviac {{count}} znak.' },
      { translationKey: 'maxLength_few', message: 'Zadajte najviac {{count}} znaky.' },
      { translationKey: 'maxLength_other', message: 'Zadajte najviac {{count}} znakov.' },
    ],
    note: 'Žiadna schéma dnes maxLength nepoužíva.',
  },
  {
    translationKey: 'uniqueItems',
    trigger: 'Duplicitné položky vo výbere alebo v poli položiek',
    sources: [
      'CheckboxGroupWidgetRJSF.tsx',
      'SelectMultipleWidgetRJSF.tsx',
      'BAArrayFieldTemplate.tsx',
    ],
    proposed: 'Odstráňte duplicitné položky.',
    note: 'Duplicitu sa v rozhraní nedá vybrať, chyba nastane len pri importe XML alebo JSON.',
  },
  {
    translationKey: 'enum',
    trigger: 'Hodnota mimo zoznamu možností',
    sources: ['SelectWidgetRJSF.tsx', 'RadioGroupWidgetRJSF.tsx'],
    proposed: 'Vyberte jednu z možností.',
    note: 'Rozhranie ponúka len platné možnosti, chyba nastane len pri importe XML alebo JSON.',
  },
  {
    translationKey: 'type',
    trigger: 'Desatinné číslo v celočíselnom poli',
    sources: ['NumberWidgetRJSF.tsx'],
    proposed: 'Zadajte hodnotu v správnom formáte.',
    note: 'Pole desatinné miesta ani text nedovolí, chyba nastane len pri importe XML alebo JSON.',
  },
  {
    translationKey: 'format.ba-slovak-zip',
    trigger: 'PSČ nemá platný tvar',
    sources: ['InputWidgetRJSF.tsx'],
    proposed: 'Zadajte PSČ v tvare 81101.',
  },
  {
    translationKey: 'format.ba-slovak-phone-number',
    trigger: 'Slovenské telefónne číslo nemá platný tvar',
    sources: ['InputWidgetRJSF.tsx'],
    proposed: 'Zadajte slovenské telefónne číslo v tvare +421912345678.',
  },
  {
    translationKey: 'format.ba-ico',
    trigger: 'IČO nemá platný tvar',
    sources: ['InputWidgetRJSF.tsx'],
    proposed: 'Zadajte IČO ako šesť až osem číslic, napríklad 00603481.',
  },
  {
    translationKey: 'format.ba-ratio',
    trigger: 'Spoluvlastnícky podiel nemá platný tvar',
    sources: ['InputWidgetRJSF.tsx'],
    proposed: 'Zadajte podiel v tvare 1/2, kde prvé číslo nie je väčšie ako druhé.',
  },
  {
    translationKey: 'format.date',
    trigger: 'Dátum nemá platný tvar',
    sources: ['DatePickerWidgetRJSF.tsx'],
    proposed: 'Zadajte dátum v tvare DD.MM.RRRR.',
  },
  {
    translationKey: 'format.ba-time',
    trigger: 'Čas nemá platný tvar',
    sources: ['TimePickerWidgetRJSF.tsx'],
    proposed: 'Zadajte čas v tvare HH:MM, napríklad 14:30.',
  },
  {
    translationKey: 'format.ba-file-uuid',
    trigger: 'Neplatný identifikátor nahranej prílohy',
    sources: ['FileUploadWidgetRJSF.tsx', 'FileUploadMultipleWidgetRJSF.tsx'],
    proposed: 'Nahrajte súbor znova.',
  },
]

const uploadErrorRows: ErrorMessageRow[] = [
  {
    translationKey: 'Upload.errors.large_file',
    trigger: 'Súbor prekročil maximálnu veľkosť',
    sources: ['UploadFileCard.tsx'],
    proposed: 'Súbor je väčší ako {{maxFileSize}}. Nahrajte menší súbor.',
  },
  {
    translationKey: 'Upload.errors.invalid_file_type',
    trigger: 'Nepodporovaný formát súboru',
    sources: ['UploadFileCard.tsx'],
    proposed:
      'Tento formát súboru nepodporujeme. Nahrajte súbor v jednom z formátov {{supportedFormats}}.',
  },
  {
    translationKey: 'Upload.errors.scan_infected',
    trigger: 'Antivírová kontrola našla vírus',
    sources: ['UploadFileCard.tsx'],
    proposed: null,
  },
  {
    translationKey: 'Upload.errors.scan_error',
    trigger: 'Antivírová kontrola zlyhala',
    sources: ['UploadFileCard.tsx'],
    proposed: null,
  },
  {
    translationKey: 'Upload.errors.unknown_error',
    trigger: 'Neznáma chyba pri nahrávaní súboru',
    sources: ['UploadFileCard.tsx'],
    proposed: null,
  },
]

const uploadStatusRows: ErrorMessageRow[] = [
  {
    translationKey: 'Upload.messages.upload_queued',
    trigger: 'Súbor čaká v poradí na nahratie',
    sources: ['UploadFileCard.tsx'],
    proposed: null,
  },
  {
    translationKey: 'Upload.messages.uploading',
    trigger: 'Prebieha nahrávanie súboru',
    sources: ['UploadFileCard.tsx'],
    proposed: null,
  },
  {
    translationKey: 'Upload.messages.waiting_for_scan',
    trigger: 'Súbor čaká na antivírovú kontrolu',
    sources: ['UploadFileCard.tsx'],
    proposed: null,
  },
  {
    translationKey: 'Upload.messages.scanning',
    trigger: 'Prebieha antivírová kontrola',
    sources: ['UploadFileCard.tsx'],
    proposed: null,
  },
]

const serverErrorRows: ErrorMessageRow[] = [
  {
    translationKey: 'errors.NotAuthorizedException',
    trigger: 'Nesprávny e-mail alebo heslo',
    sources: ['LoginForm.tsx'],
    proposed:
      'E-mail alebo heslo nie je správne. Skontrolujte prihlasovacie údaje alebo si obnovte heslo.',
  },
  {
    translationKey: 'errors.NotAuthorizedException User is disabled.',
    trigger: 'Konto je deaktivované',
    sources: ['LoginForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.UserNotFoundException',
    trigger: 'Konto so zadaným e-mailom neexistuje',
    sources: ['LoginForm.tsx', 'ForgottenPasswordForm.tsx'],
    proposed: 'Konto s týmto e-mailom neexistuje. Skontrolujte e-mail alebo sa zaregistrujte.',
  },
  {
    translationKey: 'errors.UserNotConfirmedException',
    trigger: 'E-mail konta nebol overený',
    sources: ['LoginForm.tsx'],
    proposed: 'E-mail ešte nie je overený. Zadajte overovací kód, ktorý sme vám poslali.',
  },
  {
    translationKey: 'errors.UsernameExistsException',
    trigger: 'Konto so zadaným e-mailom už existuje',
    sources: ['RegisterForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.AliasExistsException',
    trigger: 'Nový e-mail už používa iné konto',
    sources: ['EmailChangeForm.tsx'],
    proposed:
      'E-mail {{email}} už používa iné Bratislavské konto. Zmenu zopakujte s iným e-mailom.',
    note: 'Súčasné znenie je veľmi dlhé a opisuje klikanie v rozhraní.',
  },
  {
    translationKey: 'errors.IncorrectPasswordException',
    trigger: 'Nesprávne súčasné heslo',
    sources: ['PasswordChangeForm.tsx', 'EmailChangeForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.InvalidPasswordException',
    trigger: 'Heslo nespĺňa požiadavky na strane servera',
    sources: ['RegisterForm.tsx', 'NewPasswordForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.InvalidParameterException',
    trigger: 'Zadané údaje sú v nesprávnom formáte',
    sources: ['RegisterForm.tsx', 'LoginForm.tsx'],
    proposed: null,
  },
  {
    translationKey:
      'errors.InvalidParameterException Cannot reset password for the user as there is no registered/verified email or phone_number',
    trigger: 'Obnova hesla pre konto bez overeného e-mailu',
    sources: ['ForgottenPasswordForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.CodeMismatchException',
    trigger: 'Nesprávny overovací kód',
    sources: ['EmailVerificationForm.tsx', 'NewPasswordForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.ExpiredCodeException',
    trigger: 'Overovaciemu kódu vypršala platnosť',
    sources: ['EmailVerificationForm.tsx', 'NewPasswordForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.LimitExceededException',
    trigger: 'Priveľa pokusov o odoslanie overovacieho kódu',
    sources: ['EmailVerificationForm.tsx', 'ForgottenPasswordForm.tsx'],
    proposed: 'Priveľa pokusov. Skúste to znova o niekoľko minút.',
  },
  {
    translationKey: 'errors.MigrationUserNotFoundException',
    trigger: 'E-mail sa nenachádza medzi minuloročnými platbami dane',
    sources: ['NewPasswordForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.UserLambdaValidationException',
    trigger: 'Neúspešné overenie, že nejde o robota',
    sources: ['RegisterForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.unsuccessful-identity-verification',
    trigger: 'Neúspešné overenie totožnosti',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY',
    trigger: 'Rodné číslo a číslo dokladu v registri nepatria tej istej osobe',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: 'Rodné číslo a číslo dokladu sa nezhodujú. Skontrolujte oba údaje.',
    note: 'Tri rôzne dôvody (nezhoda údajov, zosnulá osoba, neplatná požiadavka) majú rovnaké znenie.',
  },
  {
    translationKey: 'errors.BIRTHNUMBER_IFO_DUPLICITY',
    trigger: 'Osobné údaje už boli použité v inom konte',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.DEAD_PERSON',
    trigger: 'Osoba je v registri evidovaná ako zosnulá',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.Bad Request',
    trigger: 'Neplatná požiadavka na overenie totožnosti',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.RFO_ACCESS_ERROR',
    trigger: 'Register fyzických osôb je nedostupný',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: 'Register je momentálne nedostupný. Skúste to znova neskôr.',
  },
  {
    translationKey: 'errors.RFO_NOT_RESPONDING',
    trigger: 'Register fyzických osôb neodpovedá',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: 'Register neodpovedá. Skúste to znova neskôr.',
  },
  {
    translationKey: 'errors.API_ERROR',
    trigger: 'Neúspešné volanie backendu',
    sources: ['IdentityVerificationOfPhysicalEntityForm.tsx'],
    proposed: null,
  },
  {
    translationKey: 'errors.unknown',
    trigger: 'Chyba bez známeho kódu',
    proposed: null,
  },
]

const sections: ErrorMessageSection[] = [
  {
    title: 'Hook formuláre (prihlásenie, registrácia, profil, odťahy) – chyby polí',
    namespace: 'account',
    description: (
      <>
        Validácia beží v <code>useHookForm.ts</code> (react-hook-form + AJV). Povinné pole je v
        schéme zapísané ako minLength: 1, takže správu pre prázdne pole nesie kľúč *_required.
        Znenie je definované pre každé pole samostatne.
      </>
    ),
    rows: hookFormRows,
  },
  {
    title: 'Formuláre mestských služieb (RJSF) – existujúce chyby polí',
    namespace: 'rjsf-errors',
    description: (
      <>
        <code>useFormErrorTranslations.ts</code> prekladá chyby podľa názvu AJV chyby, nie podľa
        poľa. Týchto 10 správ pokrýva všetky formuláre mestských služieb a nevyužívajú parametre
        chyby (limit, minimum), takže nedokážu povedať konkrétny limit. Chyby formátu majú záložný
        kľúč format.unknown, ostatné názvy chýb záložný kľúč nemajú.
      </>
    ),
    rows: rjsfExistingRows,
  },
  {
    title: 'Formuláre mestských služieb (RJSF) – chýbajúce chyby polí',
    namespace: 'rjsf-errors',
    description:
      'Tieto chyby v schémach nastávajú, ale preklad neexistuje. Chyby formátu (format.*) skončia na záložnom kľúči format.unknown, takže používateľ dostane rovnakú vetu ako pri chybe pattern a nedozvie sa, aký tvar má hodnota mať. Pri ostatných názvoch chýb záloha neexistuje – i18next vráti samotný kľúč a používateľ vidí v poli anglický text ako „minimum“ alebo „const“.',
    rows: rjsfMissingRows,
  },
  {
    title: 'Prílohy – chyby polí',
    namespace: 'account',
    description: 'Chyby nahrávania súborov v poliach s prílohou vo formulároch mestských služieb.',
    rows: uploadErrorRows,
  },
  {
    title: 'Prílohy – stavy (nie chyby)',
    namespace: 'account',
    description: 'Priebehové stavy zobrazené v karte súboru, doplnené pre celkový prehľad.',
    rows: uploadStatusRows,
  },
  {
    title: 'Prihlásenie a overenie totožnosti – chyby zo servera',
    namespace: 'account',
    description:
      'Nie sú to chyby polí. Zobrazujú sa ako upozornenie nad formulárom, aj keď väčšina sa vzťahuje na konkrétne pole (heslo, e-mail, overovací kód) a dala by sa presunúť k poľu. Viaceré znenia opisujú klikanie v rozhraní alebo majú rovnaký text pre rôzne dôvody zamietnutia.',
    rows: serverErrorRows,
  },
]

const ErrorMessageTable = ({
  namespace,
  rows,
}: Pick<ErrorMessageSection, 'namespace' | 'rows'>) => {
  const { t } = useTranslation(namespace)

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white text-left text-size-p-small">
        <thead>
          <tr className="border-b border-solid border-gray-300">
            <th className="w-1/5 p-2 align-top">Kľúč</th>
            <th className="w-1/4 p-2 align-top">Súčasné znenie</th>
            <th className="w-1/4 p-2 align-top">Navrhované znenie</th>
            <th className="w-1/4 p-2 align-top">Kde a kedy sa zobrazí</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ translationKey, trigger, sources, proposed, note }) => {
            const current = t(translationKey)
            const isMissing = current === translationKey
            // useFormErrorTranslations checks whether the format key exists and falls back to
            // `format.unknown`. Error names other than `format` have no such fallback.
            const fallbackTranslationKey = translationKey.startsWith('format.')
              ? 'format.unknown'
              : null

            return (
              <tr key={translationKey} className="border-b border-solid border-gray-200">
                <td className="p-2 align-top">
                  <code className="break-all">{`${namespace}:${translationKey}`}</code>
                </td>
                <td className="p-2 align-top text-error">
                  {isMissing && fallbackTranslationKey && (
                    <>
                      {t(fallbackTranslationKey)}
                      <div className="pt-1 text-gray-500">
                        Preklad kľúča chýba, použije sa záložný{' '}
                        <code>{fallbackTranslationKey}</code>
                      </div>
                    </>
                  )}
                  {isMissing && !fallbackTranslationKey && (
                    <span className="font-bold text-error">
                      Preklad chýba, používateľ vidí <code>{translationKey}</code>
                    </span>
                  )}
                  {!isMissing && current}
                </td>
                <td className="p-2 align-top text-error">
                  {Array.isArray(proposed) ? (
                    <ul className="flex flex-col gap-2">
                      {proposed.map((proposedMessage) => (
                        <li key={proposedMessage.translationKey}>
                          <code className="break-all text-gray-700">
                            {proposedMessage.translationKey}
                          </code>
                          <div>{proposedMessage.message}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    (proposed ?? <span className="text-gray-500">Ponechať súčasné znenie</span>)
                  )}
                </td>
                <td className="p-2 align-top">
                  {trigger}
                  {sources && (
                    <div className="flex flex-wrap gap-x-2 pt-1">
                      {sources.map((source) => (
                        <code key={source} className="break-all">
                          {source}
                        </code>
                      ))}
                    </div>
                  )}
                  {note && <div className="pt-1 text-gray-500">{note}</div>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const ErrorMessagesShowCase = () => {
  return (
    <>
      <Wrapper title="Chybové správy vo formulároch" direction="column" noBorder>
        <Typography variant="p-default">
          Prehľad všetkých chybových správ vo formulároch vygeneroval Claude Code z kódu aplikácie a
          z testovania vo formulárovom playgrounde. Stĺpec Navrhované znenie je podklad na diskusiu,
          nie schválený text. Súčasné znenie sa načítava priamo z prekladov, takže tabuľka je vždy
          aktuálna. Aplikácia má dva nezávislé systémy validácie a každý má vlastný súbor s
          prekladmi: <code>public/locales/sk/account.json</code> pre hook formuláre a{' '}
          <code>public/locales/sk/rjsf-errors.json</code> pre formuláre mestských služieb.
        </Typography>
      </Wrapper>

      {sections.map(({ title, namespace, description, rows }) => (
        <Wrapper key={title} title={title} direction="column">
          <Typography variant="p-default" className="pb-4">
            {description}
          </Typography>
          <ErrorMessageTable namespace={namespace} rows={rows} />
        </Wrapper>
      ))}

      <Wrapper title="Chyby na úrovni poľa vo formulároch mestských služieb" direction="column">
        <Typography variant="p-default">
          Formuláre mestských služieb nedokážu mať znenie chyby pre konkrétne pole – správa sa
          vyberá len podľa názvu AJV chyby. Znenie ako „Zadajte rodné číslo v tvare 123456/7890.“
          preto v týchto formulároch nie je možné použiť bez úpravy kódu: generátor polí v{' '}
          <code>forms-shared</code> by musel dostať voliteľné znenia chýb, uložiť ich do schémy a{' '}
          <code>useFormErrorTranslations.ts</code> by ich hľadal podľa cesty k poľu ešte pred
          záložným prekladom podľa názvu chyby.
        </Typography>
      </Wrapper>

      <Wrapper title="Pravidlá pre znenie chybovej správy" direction="column">
        <Typography variant="p-default">
          Text sa vypisuje presne tak, ako je uložený v prekladoch. Každé znenie preto musí začínať
          veľkým písmenom a končiť bodkou, prípadne tromi bodkami, ak veta pokračuje príkladom ako
          +421… Ak správa obsahuje počet, potrebuje tri tvary (<code>_one</code>, <code>_few</code>,{' '}
          <code>_other</code>) a volanie <code>t()</code> s parametrom <code>count</code>, pretože
          slovenčina počítaný predmet skloňuje – „1 znak“, „2 znaky“, „5 znakov“.
        </Typography>
      </Wrapper>
    </>
  )
}

export default ErrorMessagesShowCase
