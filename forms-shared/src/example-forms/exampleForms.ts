import priznanieKDaniZNehnutelnostiExample1 from './examples/priznanieKDaniZNehnutelnostiExample1'
import priznanieKDaniZNehnutelnostiExample5 from './examples/priznanieKDaniZNehnutelnostiExample5'
import priznanieKDaniZNehnutelnostiExample2 from './examples/priznanieKDaniZNehnutelnostiExample2'
import priznanieKDaniZNehnutelnostiExample3 from './examples/priznanieKDaniZNehnutelnostiExample3'
import priznanieKDaniZNehnutelnostiExample4 from './examples/priznanieKDaniZNehnutelnostiExample4'
import predzahradkyExample from './examples/predzahradkyExample'
import { ExampleForm } from './types'
import zavazneStanoviskoKInvesticnejCinnostiExample from './examples/zavazneStanoviskoKInvesticnejCinnostiExample'
import komunitneZahradyExample from './examples/komunitneZahradyExample'
import stanoviskoKInvesticnemuZameruExample from './examples/stanoviskoKInvesticnemuZameruExample'

export const exampleForms: Record<string, ExampleForm[]> = {
  'stanovisko-k-investicnemu-zameru': [stanoviskoKInvesticnemuZameruExample],
  'zavazne-stanovisko-k-investicnej-cinnosti': [zavazneStanoviskoKInvesticnejCinnostiExample],
  predzahradky: [predzahradkyExample],
  'komunitne-zahrady': [komunitneZahradyExample],
  'priznanie-k-dani-z-nehnutelnosti': [
    priznanieKDaniZNehnutelnostiExample1,
    priznanieKDaniZNehnutelnostiExample2,
    priznanieKDaniZNehnutelnostiExample3,
    priznanieKDaniZNehnutelnostiExample4,
    priznanieKDaniZNehnutelnostiExample5,
  ],
}

export const exampleDevForms: Record<string, ExampleForm[]> = {
  'ziadost-o-pridelenie-najomneho-bytu': [],
}
