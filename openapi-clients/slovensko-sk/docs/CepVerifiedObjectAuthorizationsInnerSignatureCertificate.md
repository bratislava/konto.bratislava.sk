# CepVerifiedObjectAuthorizationsInnerSignatureCertificate

Podpisový certifikát.

## Properties

| Name              | Type       | Description                                   | Notes                             |
| ----------------- | ---------- | --------------------------------------------- | --------------------------------- |
| **serial_number** | **string** | Sériové číslo podpisového certifikátu.        | [optional] [default to undefined] |
| **issuer**        | **string** | Vydavateľ podpisového certifikátu.            | [optional] [default to undefined] |
| **subject**       | **string** | Subjekt podpisového certifikátu.              | [optional] [default to undefined] |
| **mandate**       | **string** | Informácie o mandáte podpisového certifikátu. | [optional] [default to undefined] |

## Example

```typescript
import { CepVerifiedObjectAuthorizationsInnerSignatureCertificate } from './api'

const instance: CepVerifiedObjectAuthorizationsInnerSignatureCertificate = {
  serial_number,
  issuer,
  subject,
  mandate,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
