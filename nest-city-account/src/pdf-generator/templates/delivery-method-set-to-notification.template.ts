export const deliveryMethodSetToNotificationHtml = `
<html lang="sk">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=windows-1250" />
    <style>
        @font-face {
            font-family: Inter;
        }
        p.Normal, li.Normal, div.Normal {
            margin: 0;
            text-autospace: none;
            font-size: 11.0pt;
            font-family: "Times New Roman", serif;
        }
        @page WordSection1 {
            size: 595.3pt 841.9pt;
            margin: 70.85pt 70.85pt 70.85pt 70.85pt;
        }
        div.WordSection1 {
            page: WordSection1;
        }
    </style>
  </head>
  <body lang="SK" style=" word-wrap: break-word">
    <div class="WordSection1">
      <p class="Normal" style="text-align: center; line-height: 150%">
        <span style="font-size: 10pt; line-height: 150%; font-family: Inter; letter-spacing: -0.1pt">Hlavné mesto Slovenskej republiky Bratislava, Primaciálne námestie 1, 814 99
        Bratislava</span>
      </p>
      <div style="height: 2.5em;"></div>
      <p class="Normal"
         style="margin-bottom: 12pt; text-align: center; line-height: 115%">
        <b>
        <span style="font-family: Inter; letter-spacing: -0.1pt">SÚHLAS SO ZASIELANÍM OZNÁMENÍ
        </span>
        </b><b>
        <span style="font-size: 10pt; line-height: 115%; font-family: Inter; letter-spacing: -0.1pt"></span>
      </b>
      </p>
      <div style="height: 1.1em;"></div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 4pt;">
        <tbody>
          <tr>
            <td style="width: 200px; vertical-align: top; padding: 0;">
              <p class="Normal" style="margin-top: 4pt">
                <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">
                Meno a priezvisko:
                </span>
              </p>
            </td>
            <td style="vertical-align: top; padding: 0;">
              <p class="Normal" style="margin-top: 4pt">
                <b>
                  <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">{{name}}</span>
                </b>
              </p>
            </td>
          </tr>
          <tr>
            <td style="width: 200px; vertical-align: top; padding: 0;">
              <p class="Normal" style="margin-top: 4pt">
                <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">
                Kontaktná e-mailová adresa:
                </span>
              </p>
            </td>
            <td style="vertical-align: top; padding: 0;">
              <p class="Normal" style="margin-top: 4pt">
                <b>
                  <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">{{email}}</span>
                </b>
              </p>
            </td>
          </tr>
          <tr>
            <td style="width: 200px; vertical-align: top; padding: 0;">
              <p class="Normal" style="margin-top: 4pt">
                <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">
                Rodné číslo:
                </span>
              </p>
            </td>
            <td style="vertical-align: top; padding: 0;">
              <p class="Normal" style="margin-top: 4pt">
                <b>
                  <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">{{birthNumber}}</span>
                </b>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="height: 1.5em;"></div>
      <p class="Normal" align="center" style="text-align: center">
        <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">
        <b>odkliknutím tlačidla „Potvrdzujem a&nbsp;súhlasím“</b> ako daňový subjekt
        </span>
      </p>
      <p class="Normal" align="center" style="text-align: center">
        <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">
        <b>udeľujem
        </b> hlavnému mestu Slovenskej republiky Bratislave (ďalej len „Hlavné mesto“) ako správcovi
        dane<b> <u>výslovný súhlas so zasielaním</u>:</b>
        </span>
      </p>
      <div style="height: 1.1em;"></div>
      <div style="height: 1.1em;"></div>
      <table style="width: 100%; border-collapse: collapse; margin-left: 0;">
        <tr>
          <td style="width: 18pt; vertical-align: top; font-size: 10pt; font-family: Symbol;">·</td>
          <td style="text-align: justify; padding-bottom: 4pt;">
            <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt;">
            <b>oznámení o&nbsp;výške dane z&nbsp;nehnuteľností a&nbsp;lehote na jej úhradu</b> a
            </span>
          </td>
        </tr>
        <tr>
          <td style="width: 18pt; vertical-align: top; font-size: 10pt; font-family: Symbol;">·</td>
          <td style="text-align: justify;">
            <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt;">
            <b>oznámení o výške miestneho poplatku za komunálne odpady a&nbsp;drobné stavebné odpady</b>
            alebo preddavku na tento poplatok a <b>lehote na jeho úhradu</b>
            </span>
          </td>
        </tr>
      </table>
      <p class="Normal" style="margin-left: 18pt; text-align: justify">
        <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">(ďalej len „Oznámenie“) </span>
      </p>
      <div style="height: 1.1em;"></div>
      <p class="Normal" style="text-align: justify">
        <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">spôsobom v zmysle § 98b ods. 5 zákona č. 582/2004 Z. z. o&nbsp;miestnych daniach
        a&nbsp;miestnom poplatku za komunálne odpady a&nbsp;drobné stavebné odpady v&nbsp;znení
        neskorších predpisov v&nbsp;spojení s § 3 ods. 2 všeobecne záväzného nariadenia Hlavného
        mesta č. ......./2024 o&nbsp;podrobnostiach pri elektronickej komunikácii
        a&nbsp;poskytovaní elektronických služieb, a&nbsp;to konkrétne: </span>
      </p>
      <div style="height: 2.2em;"></div>
      <p class="Normal" align="center" style="text-align: center">
        <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">
        <b><u>prostredníctvom osobnej internetovej zóny v informačnom systéme Hlavného mesta, t.j.
        prostredníctvom Bratislavského konta</u></b>.
        </span>
      </p>
      <div style="height: 2.2em;"></div>
      <p class="Normal" style="text-align: justify">
        <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">
        Oznámenia mi môžu byť doručované aj na moju Kontaktnú e-mailovú adresu
        v&nbsp;zašifrovanej podobe. Beriem na vedomie, že
        <b>Oznámenia mi nebudú doručované prostredníctvom pošty</b>. Obsahom Oznámenia
        <b>je informácia o výške príslušnej miestnej dane alebo miestneho poplatku, lehota na ich
        úhradu a&nbsp;potrebné platobné údaje</b>.
        </span>
      </p>
      <div style="height: 1.1em;"></div>
      <p class="Normal" style="text-align: justify">
        <span style="font-size: 10pt; font-family: Inter">
        Potvrdzujem, že som sa oboznámil so skutočnosťou, že
        <b>pri neuhradení sumy v&nbsp;zmysle Oznámenia</b>v lehote určenej v&nbsp;Oznámení, Hlavné mesto <b> vyrubí daň alebo poplatok rozhodnutím </b> a&nbsp;toto rozhodnutie mi bude ako daňovému subjektu doručované štandardne poštou do vlastných rúk.
        </span>
      </p>
      <div style="height: 1.1em;"></div>
      <p class="Normal" style="text-align: justify">
        <span style="font-size: 10pt; font-family: Inter; letter-spacing: -0.1pt">Nezaplatenie dane, poplatku alebo preddavku na
        poplatok na základe Oznámenia <b>nie je správnym deliktom</b>. Daň uhradená v lehote uvedenej v Oznámení sa považuje za právoplatne vyrubenú dňom jej zaplatenia. Poplatok alebo preddavok na poplatok uhradený v lehote uvedenej v Oznámení sa považuje za právoplatne vyrubený dňom jeho zaplatenia. Proti Oznámeniu<b> nemožno podať opravné prostriedky</b>. </span>
      </p>
      <div style="height: 1.1em;"></div>
      <p class="Normal" style="text-align: justify">
        <span style="font-size: 10pt; font-family: Inter">Zároveň výslovne vyhlasujem, že
        <b>som sa oboznámil s&nbsp;podmienkami spracúvania osobných údajov</b> Hlavného mesta ako
        prevádzkovateľa osobných údajov a&nbsp;beriem na vedomie, že ich spracúvanie je nevyhnutné
        na spracovanie a&nbsp;doručenie Oznámenia a&nbsp;splnenie ďalších súvisiacich zákonných
        povinností. </span>
      </p>
      <div style="height: 2.2em;"></div>
      <p class="Normal" style="margin-top: 4pt; text-align: justify">
        <span style="font-size: 10pt; font-family: Inter">Dátum udelenia súhlasu {{date}}</span>
      </p>
      <div style="height: 1.1em;"></div>
    </div>
  </body>
</html>
`
