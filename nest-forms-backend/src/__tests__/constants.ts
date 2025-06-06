/* eslint-disable pii/no-email */
/* eslint-disable no-secrets/no-secrets */
/* eslint-disable unicorn/no-thenable */

export const testJsonData = {
  prilohy: {
    projektovaDokumentacia: ['string'],
  },
  ziadatel: {
    ziatetelTyp: 'Právnicka osoba',
    ziadatelObchodneMeno: 'string',
    ziadatelIco: -2736,
    ziadatelMiestoPodnikania: 'string',
    ziadatelAdresaSidla: 'string',
    ziadatelMestoPsc: {
      ziadatelMesto: 'mesto',
      ziadatelPsc: 'string',
    },
    ziadatelKontaktnaOsoba: 'test',
    ziadatelEmail: 'ziadatel@test.sk',
    ziadatelTelefon: '+449',
  },
  investor: {
    investorZiadatelom: true,
    splnomocnenie: ['string'],
    investorTyp: 'Právnicka osoba',
    investorMenoPriezvisko: 'Janko Hrasko',
    investorMiestoPodnikania: 'string',
    investorMestoPsc: {
      investorMesto: 'mesto',
      investorPsc: 'string',
    },
    investorEmail: 'investor@test.sk',
    investorTelefon: '+4',
  },
  projektant: {
    projektantMenoPriezvisko: 'Fero Mrkva',
    projektantEmail: 'projektant@test.sk',
    projektantTelefon: '+5',
    autorizacneOsvedcenie: 'string',
    datumSpracovania: '1989-03-27',
  },
  stavba: {
    stavbaNazov: 'string',
    stavbaDruh: 'Bytový dom',
    stavbaUlica: 'string',
    stavbaParcela: 'string',
    stavbaKataster: ['Karlova Ves'],
  },
  konanie: {
    konanieTyp: 'Konanie o dodatočnom povolení stavby',
    ziadostOdovodnenie: 'Dodatočné povolenie zmeny stavby pred dokončením',
    stavbaFotodokumentacia: ['string', 'string'],
    stavbaPisomnosti: ['string', 'string'],
  },
}

/* eslint-enable unicorn/no-thenable */
/* eslint-enable no-secrets/no-secrets */
/* eslint-enable pii/no-email */
