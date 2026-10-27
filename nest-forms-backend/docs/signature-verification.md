# Slovensko.sk CEP signature verification: observed behaviour

Findings from probing `POST /api/cep/verify` of slovensko-sk-api with 67 signature containers (FIX environment,
slovensko-sk-api 8.9.4 premium, October 2026). Where the official documentation covers a finding, it is summarised in
[Official documentation](#official-documentation).

## Endpoint

- `/api/cep/verify` exists only in the **premium** build of slovensko-sk-api. The community build (3.8.3) does not
  have it.
- It answers `201`, Swagger documents `200`.

## Response

Two levels. `verify_result` other than `0` means CEP refused to verify the container, `verified_objects` is then
missing.

| `verify_result` | `verify_description`                                                | Observed for                                                                         |
| --------------: | :------------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
|             `0` | OK                                                                  | Container verified, see the per-signature result                                     |
|       `2111217` | Podpisový certifikát vydaný nepodporovanou certifikačnou autoritou. | Signing certificate not issued by a qualified CA, **every** such case                |
|       `2111212` | Nepodporovaný formát podpisu                                        | Not a zip (random bytes, text, PNG, gzip, truncated zip), ASiC without the signature |
|       `2111235` | Nepodarilo sa získať podpísané dáta                                 | Zip that is not a signature container                                                |
|       `2111042` | Nepodporované dáta.                                                 | Bare XML (unsigned form XML, or the XAdES file alone)                                |
|       `2111204` | Správa neobsahuje žiadny podpísaný dokument.                        | Unsigned PDF                                                                         |
|       `2111001` | Interná chyba                                                       | Not base64, corrupted zip, ASiC with the data file renamed                           |

With `verify_result` `0`, `verified_objects` always had exactly one object with `id: null`, and
`authorizations[]` one entry per signature with `verification.result` and `verification.verifier.result`:

| `verification.result`               | `verifier.result`                                                      | Observed for                      |
| :---------------------------------- | :--------------------------------------------------------------------- | :-------------------------------- |
| `1` Platná                          | –                                                                      | Never, see below                  |
| `2` Neplatná                        | `1` `INVALID - REVOKED`                                                | Revoked certificate               |
| `2` Neplatná                        | `2` `INVALID - HASH_FAILURE`                                           | Signed data changed after signing |
| `2` Neplatná                        | `3` `INVALID - SIG_CRYPTO_FAILURE`                                     | Signature value changed           |
| `3` Predbežne platná                | `17` `INDETERMINATE - TRY_LATER - Prevalid certificate…`               | **Every valid signature**         |
| `4` Pravdepodobne platná            | –                                                                      | Never                             |
| `5` Neoverená                       | –                                                                      | Never                             |
| `6` Aktuálne nie je možné rozhodnúť | `20` `INDETERMINATE - OUT_OF_BOUNDS_NO_POE - Certificate has expired…` | Expired certificate               |

- `6` is missing from the slovensko-sk-api spec, which lists only `1`–`5`. CEP documents it, see below.
- There is no published list of `verifier.result` codes, the codes above are only the ones observed. The descriptions
  use ETSI validation indications and sub-indications (`INDETERMINATE`, `TRY_LATER`, `OUT_OF_BOUNDS_NO_POE`, …), the
  numbers are CEP's own. The official guide only says the code identifies the specific cause for machine processing.
- All signatures from the signers in use (D.Signer and others) are XAdES baseline B without a timestamp
  (`format: "XadesBPLevelB"`, `timestamped: false`). That is why a valid signature returns `3`, not `1`, regardless of
  the signer.
- Without a timestamp a signature turns from `3` into `6` once its certificate expires. Verification is only meaningful
  at signing/sending time, re-verifying old signatures rejects legitimate ones.
- Expiry is checked before revocation: a revoked certificate that has since expired returns `6`/`20`, not `2`/`1`.
- CEP ignores the ASiC `mimetype` entry and accepts extra files in the container (an unsigned PDF next to the form, a
  file in `META-INF`, a removed manifest) as long as the signature is valid.
- A container with the same signature file twice (`signatures001.xml`, `signatures002.xml`) returns two authorizations.

## Personal data in the response

- `signature.certificate.subject` and `mandate` (a 1–3 KB base64 blob, present even for ordinary citizens),
- `objects[].content`: the whole signed form XML,
- `verifier.description` of revoked certificates: the full certificate subject, including the birth number.

## Official documentation

- [Dokumentácia funkčnosti Centrálnej elektronickej podateľne](https://www.slovensko.sk/_img/CMS4/Dokumentacia_funkcnosti_CEP.pdf)
  (v1.17, May 2024), chapter 5.1.4
- [Návod k používaniu správy Výsledok informatívneho overenia podpisov](https://www.slovensko.sk/_img/CMS4/Navody/Navod_vysledok_overenia_podpisov.pdf)
  (v4, April 2024), chapter 2
- [slovensko-sk-api](https://github.com/slovensko-digital/slovensko-sk-api), its OpenAPI spec describes
  `/api/cep/verify`

What they say about the observed results:

- **`3` is the best possible result here.** The synchronous informative verification verifies a signature without a
  timestamp against the current time and the latest CRL/OCSP data, its result is only preliminary ("predbežne
  platná"). A final "platná" comes only from the asynchronous verification of messages delivered to public
  authorities, where CEP adds a qualified timestamp internally.
- **`6` "nie je možné rozhodnúť"** is returned only for XAdES baseline and PAdES baseline signatures. Typically an
  expired certificate without proof of existence of the signature before the expiry, in a final verification it is
  "usually interpreted as an invalid signature". It can also mean CEP does not support the signature (e.g. an
  algorithm required by NBÚ that CEP lacks, or an unknown signature policy), and it is returned whenever the XAdES
  baseline component returns something other than valid, invalid or preliminarily valid.
- **`5` "neoverená"** is returned only when the XAdES_ZEP or CAdES components fail with an application error, formats
  the signers in use do not produce.
- **Intermediate CAs are not accepted.** CEP trusts only a CA that directly issued the signing certificate and is
  itself listed in the EU trusted list. A qualified certificate issued by an intermediate CA is rejected (not tested,
  most likely `2111217`).

## Latency

Through nest-forms-backend dev, requests one at a time:

|                                | Median |  Max |
| :----------------------------- | -----: | ---: |
| Rejected at the top level      |  0.6 s | 20 s |
| Verified (`verify_result` `0`) |  1.5 s | 17 s |

The first verification after a pause took 15–25 s, the same request right after about 1.5 s.

## Limits

- Base64 with line breaks verifies fine.
- A ~4 MB request (3 MB container) was cut off by the nest-forms-backend dev ingress with an nginx HTML `413`. Real
  containers are 8–35 KB.

## Test cases

### Certificate not issued by a qualified CA

All `2111217`.

| #   | Signing certificate                                         |
| :-- | :---------------------------------------------------------- |
| 01  | eID authentication certificate (issuer SVK eID PCA)         |
| 02  | eID authentication certificate (SVK eID PCA), second sample |
| 03  | eID encryption certificate (SVK eID SCA)                    |
| 04  | Windows work account certificate (MS-Organization-Access)   |
| 05  | Windows work account certificate, second sample             |
| 06  | Windows login identity (login.windows.net)                  |
| 07  | Self-signed, random ID as the subject                       |
| 08  | Self-signed, random ID as the subject, second sample        |
| 09  | Self-signed, person's name as the subject                   |
| 10  | Self-signed, `trust_` prefix                                |
| 11  | AS2 user certificate                                        |
| 12  | Company email certificate                                   |
| 13  | Corporate CA (Eaton)                                        |
| 14  | Corporate CA (SLSP S/MIME)                                  |
| 15  | Corporate CA (Dimension Data)                               |
| 16  | Corporate CA (EHS)                                          |
| 17  | Corporate CA (MIRRI)                                        |
| 18  | Apple iPhone device certificate                             |
| 19  | Test CA (DITEC Test CA)                                     |
| 20  | Non-qualified CA (I.CA Public CA)                           |
| 21  | Non-qualified CA (Disig AuthCA02)                           |
| 22  | Non-qualified CA (Autentifikacna CA 02)                     |
| 23  | EUScomp                                                     |

### Qualified certificates

All `verify_result` `0`.

| #   | Signing certificate                                                                       | Result (verifier) |
| :-- | :---------------------------------------------------------------------------------------- | :---------------- |
| 24  | eID qualified certificate, revoked                                                        | `2` (`1`)         |
| 25  | eID qualified certificate, revoked and since expired                                      | `6` (`20`)        |
| 26  | eID qualified certificate, valid (baseline for synthetic cases)                           | `3` (`17`)        |
| 27  | eID qualified certificate, signed in 2024, still valid                                    | `3` (`17`)        |
| 28  | eID qualified certificate, signed in 2024, expired                                        | `6` (`20`)        |
| 29  | Other qualified certificate (Slovak or foreign CA), valid                                 | `3` (`17`)        |
| 30  | Other qualified certificate, expired                                                      | `6` (`20`)        |
| 31  | Valid qualified certificate, other DSS-based signer (`id-<hex>` IDs, `signatures001.xml`) | `3` (`17`)        |

Other qualified CAs tried: CA Disig QCA4, I.CA EU Qualified, SNCA4, CAMOSR4, PostSignum, Certum, COPE SZAFIR.

### Built from case 26

| #   | Content                                                    | Response                                 |
| :-- | :--------------------------------------------------------- | :--------------------------------------- |
| 40  | Not base64                                                 | `2111001`                                |
| 41  | Random bytes                                               | `2111212`                                |
| 42  | Plain text                                                 | `2111212`                                |
| 43  | Base64 wrapped at 76 characters                            | `0`, `3` (`17`)                          |
| 44  | Unsigned form XML only                                     | `2111042`                                |
| 45  | XAdES signature XML only, without the signed data          | `2111042`                                |
| 46  | ASiC with the signature file removed                       | `2111212`                                |
| 47  | Form XML changed after signing                             | `0`, `2` (`2` HASH_FAILURE)              |
| 48  | One character of `<ds:SignatureValue>` changed             | `0`, `2` (`3` SIG_CRYPTO_FAILURE)        |
| 49  | `mimetype` entry set to `application/zip`                  | `0`, `3` (`17`)                          |
| 50  | Minimal unsigned PDF                                       | `2111204`                                |
| 52  | PNG image                                                  | `2111212`                                |
| 53  | Valid ASiC compressed with gzip                            | `2111212`                                |
| 54  | Valid ASiC cut in half                                     | `2111212`                                |
| 55  | Valid ASiC with 100 bytes flipped in the middle            | `2111001`                                |
| 56  | Empty zip                                                  | `2111235`                                |
| 57  | Zip with a text file                                       | `2111235`                                |
| 58  | Zip with a PDF and a PNG                                   | `2111235`                                |
| 59  | docx-like zip                                              | `2111235`                                |
| 60  | Valid ASiC nested inside a plain zip                       | `2111235`                                |
| 61  | Zip with only the ASiC `mimetype` entry                    | `2111235`                                |
| 62  | ASiC `mimetype` and an unsigned PDF, no `META-INF`         | `2111235`                                |
| 63  | Valid ASiC plus an extra unsigned PDF                      | `0`, `3` (`17`)                          |
| 64  | Valid ASiC plus an extra file in `META-INF`                | `0`, `3` (`17`)                          |
| 65  | Valid ASiC with `META-INF/manifest.xml` removed            | `0`, `3` (`17`)                          |
| 66  | Valid ASiC with the form XML entry renamed, content kept   | `2111001`                                |
| 67  | `META-INF/signatures001.xml` copied to `signatures002.xml` | `0`, two authorizations, both `3` (`17`) |

## Reproducing

- **Wrong certificate:** sign with any certificate that is not a qualified signing certificate. Signers that can use
  the Windows certificate store (e.g. Autogram) can sign with a self-signed one:
  `New-SelfSignedCertificate -Subject "CN=Test" -CertStoreLocation Cert:\CurrentUser\My -KeyUsage DigitalSignature`.
- **Expired or revoked:** only an old container whose certificate has expired or was revoked since, cannot be created
  on demand.
- **Synthetic cases:** modify a valid container with any zip library as described in the table. The form XML is the
  entry outside `META-INF` that is not `mimetype`.
- Real containers contain personal data, keep them and the raw responses out of the repository, logs and tickets.
