import priznanieKDaniZNehnutelnosti from './priznanie-k-dani-z-nehnutelnosti'
import komunitneZahrady from './komunitne-zahrady'
import predzahradky from './predzahradky'
import stanoviskoKInvesticnemuZameru from './stanovisko-k-investicnemu-zameru'
import zavazneStanoviskoKInvesticnejCinnosti from './zavazne-stanovisko-k-investicnej-cinnosti'

export type FormVersion = {
  version: string
  schemas: any
  isLatest: boolean
}

export type FormDefinition = {
  id: string
  versions: FormVersion[]
}

export const formDefinitions: FormDefinition[] = [
  {
    id: 'priznanie-k-dani-z-nehnutelnosti',
    versions: [
      {
        version: '1',
        schemas: priznanieKDaniZNehnutelnosti,
        isLatest: true,
      },
    ],
  },
  {
    id: 'stanovisko-k-investicnemu-zameru',
    versions: [
      {
        version: '1',
        schemas: stanoviskoKInvesticnemuZameru,
        isLatest: true,
      },
    ],
  },
  {
    id: 'zavazne-stanovisko-k-investicnej-cinnosti',
    versions: [
      {
        version: '1',
        schemas: zavazneStanoviskoKInvesticnejCinnosti,
        isLatest: true,
      },
    ],
  },
  {
    id: 'komunitne-zahrady',
    versions: [
      {
        version: '1',
        schemas: komunitneZahrady,
        isLatest: true,
      },
    ],
  },
  {
    id: 'predzahradky',
    versions: [
      {
        version: '1',
        schemas: predzahradky,
        isLatest: true,
      },
    ],
  },
]
