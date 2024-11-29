"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitleFromStatCiselnik = exports.statCiselnik = void 0;
// Hardcoded until issues with code lists are resolved
// Downloaded from:
// https://zber.statistics.sk/sk/metaudaje/ciselniky?p_p_id=sk_susr_isis_pub_codelist_portlet_CodelistPortlet_INSTANCE_mvcy&p_p_lifecycle=1&p_p_state=normal&p_p_mode=view&_sk_susr_isis_pub_codelist_portlet_CodelistPortlet_INSTANCE_mvcy_javax.portlet.action=showCodelistDetail&_sk_susr_isis_pub_codelist_portlet_CodelistPortlet_INSTANCE_mvcy_navigationType=CODELIST_DETAIL_VIEW&p_auth=IZQkJLXQ&clCode=CL010580&clVersion=1
// Same as here:
// https://github.com/bratislava/konto.bratislava.sk/blob/master/next/schema-generator/definitions/priznanieKDaniZNehnutelnosti/statCiselnik.ts
exports.statCiselnik = [
    {
        value: '4',
        title: 'Afganská islamská republika',
    },
    {
        value: '8',
        title: 'Albánska republika',
    },
    {
        value: '10',
        title: 'Antarktída',
    },
    {
        value: '12',
        title: 'Alžírska demokratická ľudová republika',
    },
    {
        value: '16',
        title: 'Teritórium Americkej Samoy',
    },
    {
        value: '20',
        title: 'Andorrské kniežatstvo',
    },
    {
        value: '24',
        title: 'Angolská republika',
    },
    {
        value: '28',
        title: 'Antigua a Barbuda',
    },
    {
        value: '31',
        title: 'Azerbajdžanská republika',
    },
    {
        value: '32',
        title: 'Argentínska republika',
    },
    {
        value: '36',
        title: 'Austrálsky zväz',
    },
    {
        value: '40',
        title: 'Rakúska republika',
    },
    {
        value: '44',
        title: 'Bahamské spoločenstvo',
    },
    {
        value: '48',
        title: 'Bahrajnské kráľovstvo',
    },
    {
        value: '50',
        title: 'Bangladéšska ľudová republika',
    },
    {
        value: '51',
        title: 'Arménska republika',
    },
    {
        value: '52',
        title: 'Barbados',
    },
    {
        value: '56',
        title: 'Belgické kráľovstvo',
    },
    {
        value: '60',
        title: 'Bermudy',
    },
    {
        value: '64',
        title: 'Bhutánske kráľovstvo',
    },
    {
        value: '68',
        title: 'Bolívijský mnohonárodný štát',
    },
    {
        value: '70',
        title: 'Bosna a Hercegovina',
    },
    {
        value: '72',
        title: 'Botswanská republika',
    },
    {
        value: '74',
        title: 'Bouvetov ostrov',
    },
    {
        value: '76',
        title: 'Brazílska federatívna republika',
    },
    {
        value: '84',
        title: 'Belize',
    },
    {
        value: '86',
        title: 'Britské indickooceánske územie',
    },
    {
        value: '90',
        title: 'Šalamúnove ostrovy',
    },
    {
        value: '92',
        title: 'Britské Panenské ostrovy',
    },
    {
        value: '96',
        title: 'Brunejsko-darussalamský štát',
    },
    {
        value: '100',
        title: 'Bulharská republika',
    },
    {
        value: '104',
        title: 'Mjanmarská zväzová republika',
    },
    {
        value: '108',
        title: 'Burundská republika',
    },
    {
        value: '112',
        title: 'Bieloruská republika',
    },
    {
        value: '116',
        title: 'Kambodžské kráľovstvo',
    },
    {
        value: '120',
        title: 'Kamerunská republika',
    },
    {
        value: '124',
        title: 'Kanada',
    },
    {
        value: '132',
        title: 'Kapverdská republika',
    },
    {
        value: '136',
        title: 'Kajmanie ostrovy',
    },
    {
        value: '140',
        title: 'Stredoafrická republika',
    },
    {
        value: '144',
        title: 'Srílanská demokratická socialistická republika',
    },
    {
        value: '148',
        title: 'Čadská republika',
    },
    {
        value: '152',
        title: 'Čilská republika',
    },
    {
        value: '156',
        title: 'Čínska ľudová republika',
    },
    {
        value: '158',
        title: 'Čínska republika',
    },
    {
        value: '162',
        title: 'Teritórium Vianočného ostrova',
    },
    {
        value: '166',
        title: 'Teritórium Kokosových ostrovov',
    },
    {
        value: '170',
        title: 'Kolumbijská republika',
    },
    {
        value: '174',
        title: 'Komorský zväz',
    },
    {
        value: '175',
        title: 'Mayotte',
    },
    {
        value: '178',
        title: 'Konžská republika',
    },
    {
        value: '180',
        title: 'Konžská demokratická republika',
    },
    {
        value: '184',
        title: 'Cookove ostrovy',
    },
    {
        value: '188',
        title: 'Kostarická republika',
    },
    {
        value: '191',
        title: 'Chorvátska republika',
    },
    {
        value: '192',
        title: 'Kubánska republika',
    },
    {
        value: '196',
        title: 'Cyperská republika',
    },
    {
        value: '203',
        title: 'Česká republika',
    },
    {
        value: '204',
        title: 'Beninská republika',
    },
    {
        value: '208',
        title: 'Dánske kráľovstvo',
    },
    {
        value: '212',
        title: 'Dominické spoločenstvo',
    },
    {
        value: '214',
        title: 'Dominikánska republika',
    },
    {
        value: '218',
        title: 'Ekvádorská republika',
    },
    {
        value: '222',
        title: 'Salvádorská republika',
    },
    {
        value: '226',
        title: 'Republika Rovníkovej Guiney',
    },
    {
        value: '231',
        title: 'Etiópska federatívna demokratická republika',
    },
    {
        value: '232',
        title: 'Eritrejský štát',
    },
    {
        value: '233',
        title: 'Estónska republika',
    },
    {
        value: '234',
        title: 'Faerské ostrovy',
    },
    {
        value: '238',
        title: 'Falklandské ostrovy',
    },
    {
        value: '239',
        title: 'Južná Georgia a Južné Sandwichove ostrovy',
    },
    {
        value: '242',
        title: 'Fidžijská republika',
    },
    {
        value: '246',
        title: 'Fínska republika',
    },
    {
        value: '248',
        title: 'Alandy',
    },
    {
        value: '250',
        title: 'Francúzska republika',
    },
    {
        value: '254',
        title: 'Francúzska Guyana',
    },
    {
        value: '258',
        title: 'Francúzska Polynézia',
    },
    {
        value: '260',
        title: 'Francúzske južné a antarktické územia',
    },
    {
        value: '262',
        title: 'Džibutská republika',
    },
    {
        value: '266',
        title: 'Gabonská republika',
    },
    {
        value: '268',
        title: 'Gruzínsko',
    },
    {
        value: '270',
        title: 'Gambijská republika',
    },
    {
        value: '275',
        title: 'Palestínsky štát',
    },
    {
        value: '276',
        title: 'Nemecká spolková republika',
    },
    {
        value: '288',
        title: 'Ghanská republika',
    },
    {
        value: '292',
        title: 'Gibraltár',
    },
    {
        value: '296',
        title: 'Kiribatská republika',
    },
    {
        value: '300',
        title: 'Grécka republika',
    },
    {
        value: '304',
        title: 'Grónsko',
    },
    {
        value: '308',
        title: 'Grenada',
    },
    {
        value: '312',
        title: 'Guadeloup',
    },
    {
        value: '316',
        title: 'Guamské teritórium',
    },
    {
        value: '320',
        title: 'Guatemalská republika',
    },
    {
        value: '324',
        title: 'Guinejská republika',
    },
    {
        value: '328',
        title: 'Guyanská kooperatívna republika',
    },
    {
        value: '332',
        title: 'Haitská republika',
    },
    {
        value: '334',
        title: 'Teritórium Heardovho ostrova a Macdonaldových ostrovov',
    },
    {
        value: '336',
        title: 'Svätá Stolica (Vatikánsky mestský štát)',
    },
    {
        value: '340',
        title: 'Honduraská republika',
    },
    {
        value: '344',
        title: 'Hongkong',
    },
    {
        value: '348',
        title: 'Maďarsko',
    },
    {
        value: '352',
        title: 'Islandská republika',
    },
    {
        value: '356',
        title: 'Indická republika',
    },
    {
        value: '360',
        title: 'Indonézska republika',
    },
    {
        value: '364',
        title: 'Iránska islamská republika',
    },
    {
        value: '368',
        title: 'Iracká republika',
    },
    {
        value: '372',
        title: 'Írsko',
    },
    {
        value: '376',
        title: 'Izraelský štát',
    },
    {
        value: '380',
        title: 'Talianska republika',
    },
    {
        value: '384',
        title: 'Republika Pobrežia slonoviny',
    },
    {
        value: '388',
        title: 'Jamajka',
    },
    {
        value: '392',
        title: 'Japonsko',
    },
    {
        value: '398',
        title: 'Kazašská republika',
    },
    {
        value: '400',
        title: 'Jordánske hášimovské kráľovstvo',
    },
    {
        value: '404',
        title: 'Kenská republika',
    },
    {
        value: '408',
        title: 'Kórejská ľudovodemokratická republika',
    },
    {
        value: '410',
        title: 'Kórejská republika',
    },
    {
        value: '414',
        title: 'Kuvajtský štát',
    },
    {
        value: '417',
        title: 'Kirgizská republika',
    },
    {
        value: '418',
        title: 'Laoská ľudovodemokratická republika',
    },
    {
        value: '422',
        title: 'Libanonská republika',
    },
    {
        value: '426',
        title: 'Lesothské kráľovstvo',
    },
    {
        value: '428',
        title: 'Lotyšská republika',
    },
    {
        value: '430',
        title: 'Libérijská republika',
    },
    {
        value: '434',
        title: 'Líbya',
    },
    {
        value: '438',
        title: 'Lichtenštajnské kniežatstvo',
    },
    {
        value: '440',
        title: 'Litovská republika',
    },
    {
        value: '442',
        title: 'Luxemburské veľkovojvodstvo',
    },
    {
        value: '446',
        title: 'Macao',
    },
    {
        value: '450',
        title: 'Madagaskarská republika',
    },
    {
        value: '454',
        title: 'Malawijská republika',
    },
    {
        value: '458',
        title: 'Malajzia',
    },
    {
        value: '462',
        title: 'Maldivská republika',
    },
    {
        value: '466',
        title: 'Malijská republika',
    },
    {
        value: '470',
        title: 'Maltská republika',
    },
    {
        value: '474',
        title: 'Martinik',
    },
    {
        value: '478',
        title: 'Mauritánska islamská republika',
    },
    {
        value: '480',
        title: 'Maurícijská republika',
    },
    {
        value: '484',
        title: 'Spojené štáty mexické',
    },
    {
        value: '492',
        title: 'Monacké kniežatstvo',
    },
    {
        value: '496',
        title: 'Mongolsko',
    },
    {
        value: '498',
        title: 'Moldavská republika',
    },
    {
        value: '499',
        title: 'Čierna Hora',
    },
    {
        value: '500',
        title: 'Montserrat',
    },
    {
        value: '504',
        title: 'Marocké kráľovstvo',
    },
    {
        value: '508',
        title: 'Mozambická republika',
    },
    {
        value: '512',
        title: 'Ománsky sultanát',
    },
    {
        value: '516',
        title: 'Namíbijská republika',
    },
    {
        value: '520',
        title: 'Nauruská republika',
    },
    {
        value: '524',
        title: 'Nepálska federatívna demokratická republika',
    },
    {
        value: '528',
        title: 'Holandské kráľovstvo',
    },
    {
        value: '531',
        title: 'Curaçao',
    },
    {
        value: '533',
        title: 'Aruba',
    },
    {
        value: '534',
        title: 'Svätý Martin (holandská časť)',
    },
    {
        value: '535',
        title: 'Bonaire, Svätý Eustach a Saba',
    },
    {
        value: '540',
        title: 'Nová Kaledónia',
    },
    {
        value: '548',
        title: 'Vanuatská republika',
    },
    {
        value: '554',
        title: 'Nový Zéland',
    },
    {
        value: '558',
        title: 'Nikaragujská republika',
    },
    {
        value: '562',
        title: 'Nigerská republika',
    },
    {
        value: '566',
        title: 'Nigérijská federatívna republika',
    },
    {
        value: '570',
        title: 'Niue',
    },
    {
        value: '574',
        title: 'Teritórium ostrova Norfolk',
    },
    {
        value: '578',
        title: 'Nórske kráľovstvo',
    },
    {
        value: '580',
        title: 'Spoločenstvo ostrovov Severné Mariány',
    },
    {
        value: '581',
        title: 'Menšie odľahlé ostrovy Spojených štátov',
    },
    {
        value: '583',
        title: 'Mikronézske federatívne štáty',
    },
    {
        value: '584',
        title: 'Republika Marshallových ostrovov',
    },
    {
        value: '585',
        title: 'Palauská republika',
    },
    {
        value: '586',
        title: 'Pakistanská islamská republika',
    },
    {
        value: '591',
        title: 'Panamská republika',
    },
    {
        value: '598',
        title: 'Nezávislý štát Papua-Nová Guinea',
    },
    {
        value: '600',
        title: 'Paraguajská republika',
    },
    {
        value: '604',
        title: 'Peruánska republika',
    },
    {
        value: '608',
        title: 'Filipínska republika',
    },
    {
        value: '612',
        title: 'Pitcairnove ostrovy',
    },
    {
        value: '616',
        title: 'Poľská republika',
    },
    {
        value: '620',
        title: 'Portugalská republika',
    },
    {
        value: '624',
        title: 'Guinejsko-bissauská republika',
    },
    {
        value: '626',
        title: 'Východotimorská demokratická republika',
    },
    {
        value: '630',
        title: 'Portorické spoločenstvo',
    },
    {
        value: '634',
        title: 'Katarský štát',
    },
    {
        value: '638',
        title: 'Réunion',
    },
    {
        value: '642',
        title: 'Rumunsko',
    },
    {
        value: '643',
        title: 'Ruská federácia',
    },
    {
        value: '646',
        title: 'Rwandská republika',
    },
    {
        value: '652',
        title: 'Svätý Bartolomej',
    },
    {
        value: '654',
        title: 'Svätá Helena, Ascension a Tristan da Cunha',
    },
    {
        value: '659',
        title: 'Federácia Svätého Krištofa a Nevisu',
    },
    {
        value: '660',
        title: 'Anguilla',
    },
    {
        value: '662',
        title: 'Svätá Lucia',
    },
    {
        value: '663',
        title: 'Svätý Martin',
    },
    {
        value: '666',
        title: 'Saint Pierre a Miquelon',
    },
    {
        value: '670',
        title: 'Svätý Vincent a Grenadíny',
    },
    {
        value: '674',
        title: 'Sanmarínska republika',
    },
    {
        value: '678',
        title: 'Demokratická republika Svätého Tomáša a Princovho ostrova',
    },
    {
        value: '682',
        title: 'Saudskoarabské kráľovstvo',
    },
    {
        value: '686',
        title: 'Senegalská republika',
    },
    {
        value: '688',
        title: 'Srbská republika',
    },
    {
        value: '690',
        title: 'Seychelská republika',
    },
    {
        value: '694',
        title: 'Sierraleonská republika',
    },
    {
        value: '702',
        title: 'Singapurská republika',
    },
    {
        value: '703',
        title: 'Slovenská republika',
        isDefault: true,
    },
    {
        value: '704',
        title: 'Vietnamská socialistická republika',
    },
    {
        value: '705',
        title: 'Slovinská republika',
    },
    {
        value: '706',
        title: 'Somálska federatívna republika',
    },
    {
        value: '710',
        title: 'Juhoafrická republika',
    },
    {
        value: '716',
        title: 'Zimbabwianska republika',
    },
    {
        value: '724',
        title: 'Španielske kráľovstvo',
    },
    {
        value: '728',
        title: 'Juhosudánska republika',
    },
    {
        value: '729',
        title: 'Sudánska republika',
    },
    {
        value: '732',
        title: 'Západná Sahara',
    },
    {
        value: '740',
        title: 'Surinamská republika',
    },
    {
        value: '744',
        title: 'Svalbard a Jan Mayen',
    },
    {
        value: '748',
        title: 'Eswatinské kráľovstvo',
    },
    {
        value: '752',
        title: 'Švédske kráľovstvo',
    },
    {
        value: '756',
        title: 'Švajčiarska konfederácia',
    },
    {
        value: '760',
        title: 'Sýrska arabská republika',
    },
    {
        value: '762',
        title: 'Tadžická republika',
    },
    {
        value: '764',
        title: 'Thajské kráľovstvo',
    },
    {
        value: '768',
        title: 'Togská republika',
    },
    {
        value: '772',
        title: 'Tokelauské ostrovy',
    },
    {
        value: '776',
        title: 'Tongské kráľovstvo',
    },
    {
        value: '780',
        title: 'Republika Trinidadu a Tobaga',
    },
    {
        value: '784',
        title: 'Spojené arabské emiráty',
    },
    {
        value: '788',
        title: 'Tuniská republika',
    },
    {
        value: '792',
        title: 'Turecká republika',
    },
    {
        value: '795',
        title: 'Turkménsko',
    },
    {
        value: '796',
        title: 'Ostrovy Turks a Caicos',
    },
    {
        value: '798',
        title: 'Tuvalu',
    },
    {
        value: '800',
        title: 'Ugandská republika',
    },
    {
        value: '804',
        title: 'Ukrajina',
    },
    {
        value: '807',
        title: 'Severomacedónska republika',
    },
    {
        value: '818',
        title: 'Egyptská arabská republika',
    },
    {
        value: '826',
        title: 'Spojené kráľovstvo Veľkej Británie a Severného Írska',
    },
    {
        value: '831',
        title: 'Guernsey',
    },
    {
        value: '832',
        title: 'Jersey',
    },
    {
        value: '833',
        title: 'Ostrov Man',
    },
    {
        value: '834',
        title: 'Tanzánijská zjednotená republika',
    },
    {
        value: '840',
        title: 'Spojené štáty americké',
    },
    {
        value: '850',
        title: 'Panenské ostrovy Spojených štátov',
    },
    {
        value: '854',
        title: 'Burkina Faso',
    },
    {
        value: '858',
        title: 'Uruguajská východná republika',
    },
    {
        value: '860',
        title: 'Uzbecká republika',
    },
    {
        value: '862',
        title: 'Venezuelská bolívarovská republika',
    },
    {
        value: '876',
        title: 'Wallis a Futuna',
    },
    {
        value: '882',
        title: 'Samojský nezávislý štát',
    },
    {
        value: '887',
        title: 'Jemenská republika',
    },
    {
        value: '894',
        title: 'Zambijská republika',
    },
    {
        value: '896',
        title: 'Oblasti inde nešpecifikované',
    },
    {
        value: '898',
        title: 'Nešpecifikované',
    },
    {
        value: '980',
        title: 'Kosovo',
    },
    {
        value: '998',
        title: 'Nešpecifikované v súvislosti s osobami bez štátnej príslušnosti',
    },
];
function getTitleFromStatCiselnik(value) {
    if (!value) {
        return;
    }
    return exports.statCiselnik.find((item) => item.value === value)?.title;
}
exports.getTitleFromStatCiselnik = getTitleFromStatCiselnik;
