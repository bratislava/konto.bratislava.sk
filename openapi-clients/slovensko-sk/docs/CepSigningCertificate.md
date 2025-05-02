# CepSigningCertificate

Štruktúra pre výber podpisového certifkátu.

## Properties

| Name                     | Type       | Description                                                                                                                                                                                                                                                                                                                                                                                                                          | Notes                             |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| **type**                 | **string** | Typ výberu podpisového certifikátu: - &#x60;Issuer&#x60; znamená výber certifikátu podľa vydavateľa a sériového čísla, ktoré sú uvedené v atribúte &#x60;issuer&#x60;, - &#x60;Subject&#x60; znamená výber certifikátu podľa subjektu v certifikáte, ktorý je uvedený v atribúte &#x60;subject&#x60;, - &#x60;URI&#x60; znamená výber certifikátu podľa URI evidovaného na strane ÚPVS, ktorý je uvedený v atribúte &#x60;uri&#x60;. | [default to undefined]            |
| **issuer**               | **string** | Vydavateľ podpisového certifikátu, iba pre typ &#x60;Issuer&#x60;.                                                                                                                                                                                                                                                                                                                                                                   | [optional] [default to undefined] |
| **issuer_serial_number** | **string** | Sériové číslo podpisového certifikátu, iba pre typ &#x60;Issuer&#x60;.                                                                                                                                                                                                                                                                                                                                                               | [optional] [default to undefined] |
| **subject**              | **string** | Subjekt podpisového certifikátu, iba pre typ &#x60;Subject&#x60;.                                                                                                                                                                                                                                                                                                                                                                    | [optional] [default to undefined] |
| **uri**                  | **string** | URI podpisového certifikátu, iba pre typ &#x60;URI&#x60;.                                                                                                                                                                                                                                                                                                                                                                            | [optional] [default to undefined] |

## Example

```typescript
import { CepSigningCertificate } from './api'

const instance: CepSigningCertificate = {
  type,
  issuer,
  issuer_serial_number,
  subject,
  uri,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
