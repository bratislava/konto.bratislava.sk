export const oddiel2VymeraPozemkuFormula = `floorToTwoDecimals(n) = floor(n * 100) / 100;
floorToTwoDecimals(evalRatio(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) * celkovaVymeraPozemku)`

export const oddiel3JedenUcelZakladDaneFormula =
  'ceil (celkovaZastavanaPlocha * evalRatio(spoluvlastnickyPodiel))'

export const oddiel3ViacereUcelyZakladDaneFormula =
  'f(n) = evalRatio(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) * celkovaVymera; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)'

export const oddiel3ViacereUcelyCelkovaVymeraFormula =
  'f(n) = ratioNumerator(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) / 100; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)'

// The special case checks whether the denominator is number starting with 1-9 followed by 3 or more zeroes.
export const oddiel4ZakladDaneFormula = `denominator = ratioDenominator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu);
highestPowerOf10 = pow(10, floor(log10 denominator));
isSpecialCase = denominator >= 1000 and denominator % highestPowerOf10 == 0;
ceil ((isSpecialCase ? celkovaVymeraSpecialCase : ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) / 100) * evalRatio(spoluvlastnickyPodiel))`
