# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: runner/example-forms.spec.ts >> zavazne-stanovisko-k-investicnej-cinnosti >> zavazneStanoviskoKInvesticnejCinnostiExample
- Location: src/runner/example-forms.spec.ts:78:11

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[id="root_prilohy_projektovaDokumentacia"]').getByText('Nahráva sa')
Expected: 0
Received: 1

Call log:
  - Expect "toHaveCount" with timeout 60000ms
  - waiting for locator('[id="root_prilohy_projektovaDokumentacia"]').getByText('Nahráva sa')
    3 × locator resolved to 1 element
      - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - log [ref=e3]:
      - generic [ref=e4]: "0"
    - log
  - generic [ref=e7]:
    - banner [ref=e8]:
      - generic [ref=e10]:
        - generic [ref=e13]:
          - button "Preskočiť navigáciu" [ref=e14] [cursor=pointer]
          - generic "brand" [ref=e16]:
            - link "Bratislavské konto" [ref=e17] [cursor=pointer]:
              - /url: /
              - img [ref=e18]
              - paragraph [ref=e21]: Bratislavské konto
          - navigation [ref=e23]:
            - generic [ref=e24]:
              - button "Prihlásenie" [ref=e25] [cursor=pointer]
              - button "Registrácia" [ref=e26] [cursor=pointer]
        - navigation "Navigačné menu" [ref=e30]:
          - list [ref=e32]:
            - listitem [ref=e33]:
              - link "Úvod" [ref=e34] [cursor=pointer]:
                - /url: /
                - generic [ref=e35]:
                  - img [ref=e36]
                  - generic [ref=e38]: Úvod
            - listitem [ref=e39]:
              - link "Mestské služby" [ref=e40] [cursor=pointer]:
                - /url: /mestske-sluzby
                - generic [ref=e41]:
                  - img [ref=e42]
                  - generic [ref=e44]: Mestské služby
            - listitem [ref=e45]:
              - link "Moje žiadosti" [ref=e46] [cursor=pointer]:
                - /url: /moje-ziadosti
                - generic [ref=e47]:
                  - img [ref=e48]
                  - generic [ref=e50]: Moje žiadosti
            - listitem [ref=e51]:
              - link "Dane a poplatky" [ref=e52] [cursor=pointer]:
                - /url: /dane-a-poplatky
                - generic [ref=e53]:
                  - img [ref=e54]
                  - generic [ref=e56]: Dane a poplatky
    - main [ref=e57]:
      - generic [ref=e58]:
        - button
        - button
      - generic [ref=e61]:
        - generic [ref=e62]:
          - heading "Žiadosť o záväzné stanovisko k investičnej činnosti" [level=1] [ref=e63]
          - link "Viac informácií o službe Žiadosť o záväzné stanovisko k investičnej činnosti" [ref=e64] [cursor=pointer]:
            - /url: https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/zavazne-stanovisko-k-investicnej-cinnosti
            - text: Viac informácií o službe
            - img [ref=e65]
        - generic [ref=e67]:
          - button "Uložiť ako koncept" [ref=e68] [cursor=pointer]:
            - img [ref=e69]
            - text: Uložiť ako koncept
          - button "Ďalšie akcie formulára" [ref=e71] [cursor=pointer]:
            - img [ref=e72]
      - generic [ref=e76]:
        - navigation [ref=e78]:
          - list [ref=e79]:
            - listitem [ref=e80]:
              - 'button "Dokončený: Žiadateľ" [ref=e81] [cursor=pointer]':
                - generic [ref=e82]:
                  - img [ref=e84]
                  - generic [ref=e86]:
                    - generic [ref=e87]: "Dokončený:"
                    - text: Žiadateľ
            - listitem [ref=e88]:
              - 'button "Dokončený: Stavebník" [ref=e89] [cursor=pointer]':
                - generic [ref=e90]:
                  - img [ref=e92]
                  - generic [ref=e94]:
                    - generic [ref=e95]: "Dokončený:"
                    - text: Stavebník
            - listitem [ref=e96]:
              - 'button "Dokončený: Zodpovedný projektant" [ref=e97] [cursor=pointer]':
                - generic [ref=e98]:
                  - img [ref=e100]
                  - generic [ref=e102]:
                    - generic [ref=e103]: "Dokončený:"
                    - text: Zodpovedný projektant
            - listitem [ref=e104]:
              - 'button "Dokončený: Informácie o stavbe" [ref=e105] [cursor=pointer]':
                - generic [ref=e106]:
                  - img [ref=e108]
                  - generic [ref=e110]:
                    - generic [ref=e111]: "Dokončený:"
                    - text: Informácie o stavbe
            - listitem [ref=e112]:
              - 'button "Dokončený: Typ žiadosti" [ref=e113] [cursor=pointer]':
                - generic [ref=e114]:
                  - img [ref=e116]
                  - generic [ref=e118]:
                    - generic [ref=e119]: "Dokončený:"
                    - text: Typ žiadosti
            - listitem [ref=e120]:
              - 'button "6 Aktuálny: Prílohy" [ref=e121] [cursor=pointer]':
                - generic [ref=e122]:
                  - generic [ref=e123]: "6"
                  - generic [ref=e124]:
                    - generic [ref=e125]: "Aktuálny:"
                    - text: Prílohy
            - listitem [ref=e126]:
              - button "7 Sumár" [ref=e127] [cursor=pointer]:
                - generic [ref=e128]:
                  - generic [ref=e129]: "7"
                  - generic [ref=e130]: Sumár
        - generic [ref=e132]:
          - group [ref=e136]:
            - group [ref=e141]:
              - heading "Prílohy" [level=2] [ref=e143]
              - generic [ref=e146]:
                - generic [ref=e149]:
                  - generic [ref=e150]:
                    - generic [ref=e152]: Projektová dokumentácia
                    - generic [ref=e154]: Jednotlivé časti dokumentácie môžete nahrať samostatne alebo ako jeden súbor.
                  - generic [ref=e155]:
                    - generic [ref=e157] [cursor=pointer]:
                      - generic [ref=e158]:
                        - button "DropZone"
                      - button "Nahrať súbory" [ref=e159]:
                        - img [ref=e162]
                        - paragraph [ref=e164]: Nahrať súbory
                    - generic [ref=e165]:
                      - heading "Nahrávané súbory" [level=3] [ref=e166]
                      - list [ref=e167]:
                        - listitem [ref=e168]:
                          - generic [ref=e170]:
                            - img [ref=e172]
                            - generic [ref=e176]:
                              - generic [ref=e177]:
                                - heading "projektova-dokumentacia-1.pdf" [level=3] [ref=e178]
                                - generic [ref=e179]:
                                  - button "Stiahnuť" [ref=e180] [cursor=pointer]:
                                    - img [ref=e181]
                                  - generic [ref=e183]: 15.5 kB
                                  - generic [ref=e184]: •
                                  - generic [ref=e185]: Čaká na antivírovú kontrolu
                              - button "Odstrániť súbor" [ref=e187] [cursor=pointer]:
                                - img [ref=e188]
                        - listitem [ref=e191]:
                          - generic [ref=e193]:
                            - img [ref=e195]
                            - generic [ref=e197]:
                              - generic [ref=e198]:
                                - generic [ref=e199]:
                                  - heading "projektova-dokumentacia-2.pdf" [level=3] [ref=e200]
                                  - generic [ref=e201]:
                                    - generic [ref=e202]: 15.5 kB
                                    - generic [ref=e203]: •
                                    - generic [ref=e204]: Nahráva sa
                                - button "Odstrániť súbor" [ref=e206] [cursor=pointer]:
                                  - img [ref=e207]
                              - progressbar [ref=e211]:
                                - generic [ref=e214]: 100%
                - link "Čo všetko má obsahovať projektová dokumentácia" [ref=e217] [cursor=pointer]:
                  - /url: https://bratislava.sk/zivotne-prostredie-a-vystavba/rozvoj-mesta/usmernovanie-vystavby/zavazne-stanovisko-k-investicnej-cinnosti
                  - text: Čo všetko má obsahovať projektová dokumentácia
                  - img [ref=e218]
          - generic [ref=e220]:
            - button "Späť" [ref=e222] [cursor=pointer]:
              - img [ref=e223]
              - text: Späť
            - generic [ref=e225]:
              - button "Preskočiť" [ref=e226] [cursor=pointer]
              - button "Pokračovať" [ref=e227] [cursor=pointer]:
                - text: Pokračovať
                - img [ref=e228]
    - generic [ref=e232]:
      - separator [ref=e233]
      - contentinfo [ref=e234]:
        - generic [ref=e235]:
          - generic "brand" [ref=e236]:
            - link "Mesto Bratislava" [ref=e237] [cursor=pointer]:
              - /url: /
              - img [ref=e238]
              - paragraph [ref=e241]: Mesto Bratislava
          - generic [ref=e242]:
            - generic [ref=e243]:
              - link "Facebook" [ref=e244] [cursor=pointer]:
                - /url: https://www.facebook.com/Bratislava.sk/
                - img [ref=e245]
              - link "Instagram" [ref=e247] [cursor=pointer]:
                - /url: https://www.instagram.com/bratislava.sk/
                - img [ref=e248]
              - link "LinkedIn" [ref=e252] [cursor=pointer]:
                - /url: https://www.linkedin.com/company/bratislava
                - img [ref=e253]
              - link "TikTok" [ref=e255] [cursor=pointer]:
                - /url: https://www.tiktok.com/@bratislava.sk
                - img [ref=e256]
            - img [ref=e258]
        - separator [ref=e270]
        - generic [ref=e271]:
          - generic [ref=e273]:
            - paragraph [ref=e274]: Hlavné mesto Slovenskej republiky Bratislava Primaciálne námestie 1 814 99 Bratislava
            - paragraph [ref=e275]: "IČO: 00603481 DIČ: 2020372596 IČ DPH: SK2020372596"
            - paragraph [ref=e276]:
              - text: "Email:"
              - link "info@bratislava.sk" [ref=e277] [cursor=pointer]:
                - /url: mailto:info@bratislava.sk
              - text: "Infolinka 8:30-16:00:"
              - link "+421 904 099 004" [ref=e278] [cursor=pointer]:
                - /url: tel:+421904099004
              - text: "Kontakt pre médiá:"
              - link "press@bratislava.sk" [ref=e279] [cursor=pointer]:
                - /url: mailto:press@bratislava.sk
          - generic [ref=e280]:
            - heading "Právne informácie" [level=2] [ref=e281]
            - generic [ref=e282]:
              - link "Všeobecné podmienky používania - Otvoriť na novej karte" [ref=e283] [cursor=pointer]:
                - /url: https://bratislava.sk/dokumenty/vseobecne-podmienky-pouzivania-elektronickych-sluzieb-bratislavskeho-konta
                - text: Všeobecné podmienky používania
              - link "Podmienky ochrany súkromia - Otvoriť na novej karte" [ref=e284] [cursor=pointer]:
                - /url: https://bratislava.sk/dokumenty/podmienky-ochrany-sukromia-pre-bratislavske-konto
                - text: Podmienky ochrany súkromia
              - link "Ochrana osobných údajov - Otvoriť na novej karte" [ref=e285] [cursor=pointer]:
                - /url: https://bratislava.sk/ochrana-osobnych-udajov
                - text: Ochrana osobných údajov
        - separator [ref=e286]
        - button "Nastavenia cookies" [ref=e288] [cursor=pointer]
        - separator [ref=e289]
        - paragraph [ref=e291]: © 2026 Hlavné mesto Slovenskej Republiky Bratislava
  - alert [ref=e292]: Bratislavské konto
```

# Test source

```ts
  239 |  * none of them. Kept in sync with `UploadFileCard.messages.*` in
  240 |  * `next/public/locales/sk/translation.json`.
  241 |  */
  242 | const UPLOAD_IN_PROGRESS_MESSAGES = [
  243 |   'Čaká sa na nahratie',
  244 |   'Nahráva sa',
  245 |   'Čaká na antivírovú kontrolu',
  246 |   'Prebieha antivírová kontrola',
  247 | ]
  248 | 
  249 | /**
  250 |  * Assets offered to file fields. The plan cannot supply these: its value is a server-side file uuid
  251 |  * with no local counterpart.
  252 |  */
  253 | const FILE_ASSETS = [
  254 |   { path: 'test.pdf', extension: '.pdf', mime: 'application/pdf' },
  255 |   { path: 'test.png', extension: '.png', mime: 'image/png' },
  256 | ] as const
  257 | 
  258 | const assetPath = (asset: (typeof FILE_ASSETS)[number]) =>
  259 |   resolve(__dirname, '../../assets', asset.path)
  260 | 
  261 | /**
  262 |  * Picks the asset to stand in for one of the example's files.
  263 |  *
  264 |  * The example's own file name wins, because it states the intent: `nahlaseniePodnetu` declares
  265 |  * `fotografia-podnetu.jpg` and its field only accepts `.jpg,.jpeg,.png`, so handing it a PDF leaves
  266 |  * the form invalid — which surfaced only as an error alert on the summary, far from the cause.
  267 |  * `accept` is the fallback for files the example does not name.
  268 |  */
  269 | const assetFor = (fileName: string | undefined, accept: string | null) => {
  270 |   const byName = fileName
  271 |     ? FILE_ASSETS.find((asset) => fileName.toLowerCase().endsWith(asset.extension))
  272 |     : undefined
  273 |   if (byName) {
  274 |     return byName
  275 |   }
  276 | 
  277 |   const allowed = (accept ?? '')
  278 |     .split(',')
  279 |     .map((entry) => entry.trim().toLowerCase())
  280 |     .filter(Boolean)
  281 | 
  282 |   const byAccept = FILE_ASSETS.find((asset) =>
  283 |     allowed.some(
  284 |       (entry) =>
  285 |         entry === asset.extension ||
  286 |         entry === asset.mime ||
  287 |         (entry.endsWith('/*') && asset.mime.startsWith(entry.slice(0, -1))),
  288 |     ),
  289 |   )
  290 | 
  291 |   return byAccept ?? FILE_ASSETS[0]
  292 | }
  293 | 
  294 | /**
  295 |  * Uploads one file per file reference the example holds.
  296 |  *
  297 |  * Both parts matter. Uploading a *single* file regardless of how many the example declares silently
  298 |  * under-tested `prilohy.projektovaDokumentacia` and `informacieODovoze.fotoOdpadu`, which each
  299 |  * expect two — the field is valid with one, so nothing failed. And reusing the example's file names
  300 |  * keeps the uploaded files distinguishable, which is what makes the per-file wait below meaningful;
  301 |  * two files both called `test.pdf` would be indistinguishable in the UI.
  302 |  *
  303 |  * Scoped to the field's own wrapper. The Cypress spec scoped `[data-cy=file-input]` to the whole
  304 |  * step (`formRealEstateTaxReturn.cy.ts:459,665`), so it attached to whichever file input happened
  305 |  * to come first regardless of which `priznanie` it belonged to.
  306 |  */
  307 | export const uploadFile = async (
  308 |   root: Locator,
  309 |   fileNames: (string | undefined)[],
  310 |   override?: string,
  311 | ) => {
  312 |   const input = root.locator('input[type="file"]').first()
  313 | 
  314 |   if (override) {
  315 |     await input.setInputFiles(override)
  316 |   } else {
  317 |     const accept = await input.getAttribute('accept')
  318 |     const payloads = fileNames.map((fileName, index) => {
  319 |       const asset = assetFor(fileName, accept)
  320 | 
  321 |       return {
  322 |         name: fileName ?? `test-${index + 1}${asset.extension}`,
  323 |         mimeType: asset.mime,
  324 |         buffer: readFileSync(assetPath(asset)),
  325 |       }
  326 |     })
  327 | 
  328 |     await input.setInputFiles(payloads)
  329 | 
  330 |     for (const payload of payloads) {
  331 |       await expect(root.getByText(payload.name, { exact: false }).first()).toBeVisible({
  332 |         timeout: 30_000,
  333 |       })
  334 |     }
  335 |   }
  336 | 
  337 |   // The antivirus scan runs server-side, so settling can take a while.
  338 |   for (const message of UPLOAD_IN_PROGRESS_MESSAGES) {
> 339 |     await expect(root.getByText(message, { exact: false })).toHaveCount(0, { timeout: 60_000 })
      |                                                             ^ Error: expect(locator).toHaveCount(expected) failed
  340 |   }
  341 | }
  342 | 
```