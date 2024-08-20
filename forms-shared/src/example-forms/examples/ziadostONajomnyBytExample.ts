import { ExampleForm } from '../types'

const ziadostONajomnyBytExample: ExampleForm = {
  name: 'ziadostONajomnyBytExample',
  formData: {
    ziadatelZiadatelka: {
      osobneUdaje: {
        adresaTrvalehoPobytu: {
          adresaSkutocnehoPobytuRovnaka: true,
          byvanieVMestskomNajomnomByte: false,
          mestoPsc: { mesto: 'Bratislava', psc: '81101' },
          pobytVBratislaveMenejAkoRok: false,
          ulicaACislo: 'Hlavná 123',
          vlastnikNehnutelnosti: false,
        },
        datumNarodenia: '1985-03-15',
        email: 'jana.novakova@email.com',
        menoPriezvisko: { meno: 'Jana', priezvisko: 'Nováková' },
        rodinnyStav: 'Rozvedený/rozvedená',
        rodnePriezvisko: 'Kováčová',
        statnaPrislusnost: 'Slovenská',
        telefonneCislo: '+421901234567',
      },
      prijem: {
        davkaVNezamestnanosti: false,
        dochodok: false,
        inePrijmy: true,
        inePrijmyVyska: 150,
        samostatnaZarobkovaCinnost: false,
        vyzivne: true,
        vyzivneVyska: 200,
        zamestnanie: true,
        zamestnaniePrijem: 1200,
      },
      rizikoveFaktoryWrapper: {
        rizikoveFaktory: true,
        vekNajstarsiehoClena: 'menej ako 63 rokov',
        zoznamRizikovychFaktorov: [
          'Osamelý rodič (dospelá osoba), ktorý/á žije v spoločnej domácnosti s nezaopatreným dieťaťom/deťmi, avšak bez manžela/manželky alebo partnera/partnerky, a zároveň tomuto dieťaťu/deťom zabezpečuje osobnú starostlivosť.',
        ],
      },
      sucasneByvanie: { bytovaNudza: false },
      zdravotnyStav: {
        bezbarierovyByt: false,
        chronickeOchorenie: true,
        existujuceDiagnozy: ['Astma', 'Chronická paradentóza'],
        tzpPreukaz: false,
      },
    },
    manzelManzelka: { manzelManzelkaSucastouDomacnosti: false },
    druhDruzka: {
      druhDruzkaSucastouDomacnosti: true,
      osobneUdaje: {
        adresaSkutocnehoPobytu: {
          mestoPsc: { mesto: 'Bratislava', psc: '82105' },
          ulicaACislo: 'Nová 456',
          vlastnikNehnutelnosti: false,
        },
        datumNarodenia: '1982-07-22',
        menoPriezvisko: { meno: 'Peter', priezvisko: 'Horváth' },
        rodinnyStav: 'Slobodný/slobodná',
        rodnePriezvisko: 'Horváth',
        statnaPrislusnost: 'Slovenská',
      },
      prijem: {
        davkaVNezamestnanosti: false,
        dochodok: false,
        inePrijmy: false,
        samostatnaZarobkovaCinnost: true,
        samostatnaZarobkovaCinnostPrijem: 300,
        vyzivne: false,
        zamestnanie: true,
        zamestnaniePrijem: 1500,
      },
      sucasneByvanie: { situaciaRovnakaAkoVasa: true },
      zdravotnyStav: { mieraFunkcnejPoruchy: 'Od 50 % do 74 %', tzpPreukaz: true },
    },
    deti: {
      detiSucastouDomacnosti: true,
      zoznamDeti: [
        {
          osobneUdaje: {
            menoPriezvisko: { meno: 'Lucia', priezvisko: 'Nováková' },
            statnaPrislusnost: 'Slovenská',
            vlastnikNehnutelnosti: false,
            datumNarodenia: '2010-11-30',
          },
          sucasneByvanie: { situaciaRovnakaAkoVasa: true },
          prijem: { student: true, maPrijem: false },
          zdravotnyStav: { tzpPreukaz: false, chronickeOchorenie: false },
        },
        {
          osobneUdaje: {
            menoPriezvisko: { meno: 'Michal', priezvisko: 'Novák' },
            statnaPrislusnost: 'Slovenská',
            vlastnikNehnutelnosti: false,
            datumNarodenia: '2005-04-18',
          },
          sucasneByvanie: { situaciaRovnakaAkoVasa: true },
          prijem: { student: true, maPrijem: true, prijemVyska: 200 },
          zdravotnyStav: { tzpPreukaz: true, mieraFunkcnejPoruchy: 'Od 75 % do 100 %' },
        },
      ],
    },
    inyClenoviaClenkyDomacnosti: {
      inyClenoviaClenkySucastouDomacnosti: true,
      zoznamInychClenov: [
        {
          osobneUdaje: {
            menoPriezvisko: { meno: 'Mária', priezvisko: 'Kováčová' },
            statnaPrislusnost: 'Slovenská',
            datumNarodenia: '1960-09-05',
            rodinnyStav: 'Vdovec/vdova',
            rodnePriezvisko: 'Hrušková',
          },
          sucasneByvanie: { situaciaRovnakaAkoVasa: true },
          prijem: {
            zamestnanie: false,
            samostatnaZarobkovaCinnost: false,
            dochodok: true,
            vyzivne: false,
            davkaVNezamestnanosti: false,
            inePrijmy: false,
            dochodokVyska: 550,
          },
          zdravotnyStav: { tzpPreukaz: true, mieraFunkcnejPoruchy: 'Od 50 % do 74 %' },
        },
      ],
    },
    ineOkolnosti: {
      dovodyPodaniaZiadosti:
        'Potrebujeme väčší byt pre našu rastúcu rodinu a lepšie podmienky pre dieťa so zdravotným postihnutím.',
      maximalnaVyskaNajomneho: 700,
      preferovanaLokalita: ['Ružinov', 'Nové Mesto'],
      preferovanaVelkost: '3-izbový byt',
    },
  },
}

export default ziadostONajomnyBytExample
