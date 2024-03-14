import priznanieKDaniZNehnutelnosti from '../src/definitions/priznanie-k-dani-z-nehnutelnosti'
import stanoviskoKInvesticnemuZameru from '../src/definitions/stanovisko-k-investicnemu-zameru'
import zavazneStanoviskoKInvesticnejCinnosti from '../src/definitions/zavazne-stanovisko-k-investicnej-cinnosti'

const schemas = [
  {
    name: 'priznanieKDaniZNehnutelnosti',
    schema: priznanieKDaniZNehnutelnosti,
  },
  {
    name: 'stanoviskoKInvesticnemuZameru',
    schema: stanoviskoKInvesticnemuZameru,
  },
  {
    name: 'zavazneStanoviskoKInvesticnejCinnosti',
    schema: zavazneStanoviskoKInvesticnejCinnosti,
  },
]

schemas.forEach((schema) => {
  describe(schema.name, () => {
    it('matches snapshot', () => {
      expect(schema.schema).toMatchSnapshot()
    })
  })
})
