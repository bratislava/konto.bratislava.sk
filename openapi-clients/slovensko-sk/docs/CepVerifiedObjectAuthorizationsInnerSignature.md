# CepVerifiedObjectAuthorizationsInnerSignature

Podpis objektu.

## Properties

| Name            | Type                                                                                                                        | Description                                                                                                                                              | Notes                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **type**        | **string**                                                                                                                  | Typ podpisu. Pozri [Dokumentáciou funkčnosti Centrálnej elektronickej podateľne](https://www.slovensko.sk/_img/CMS4/Dokumentacia_funkcnosti_CEP.pdf).    | [optional] [default to undefined] |
| **format**      | **string**                                                                                                                  | Formát podpisu. Pozri [Dokumentáciou funkčnosti Centrálnej elektronickej podateľne](https://www.slovensko.sk/_img/CMS4/Dokumentacia_funkcnosti_CEP.pdf). | [optional] [default to undefined] |
| **certificate** | [**CepVerifiedObjectAuthorizationsInnerSignatureCertificate**](CepVerifiedObjectAuthorizationsInnerSignatureCertificate.md) |                                                                                                                                                          | [optional] [default to undefined] |
| **timestamped** | **boolean**                                                                                                                 | Indikátor či podpis obsahuje časovú pečiatku.                                                                                                            | [optional] [default to undefined] |
| **signed_at**   | **string**                                                                                                                  | Čas vytvorenia podpisu.                                                                                                                                  | [optional] [default to undefined] |

## Example

```typescript
import { CepVerifiedObjectAuthorizationsInnerSignature } from './api'

const instance: CepVerifiedObjectAuthorizationsInnerSignature = {
  type,
  format,
  certificate,
  timestamped,
  signed_at,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
