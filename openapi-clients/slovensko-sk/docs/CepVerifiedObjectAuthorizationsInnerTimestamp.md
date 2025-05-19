# CepVerifiedObjectAuthorizationsInnerTimestamp

Časová pečiatka podpisu objektu.

## Properties

| Name               | Type                                                                                                                        | Description                      | Notes                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------- |
| **certificate**    | [**CepVerifiedObjectAuthorizationsInnerTimestampCertificate**](CepVerifiedObjectAuthorizationsInnerTimestampCertificate.md) |                                  | [optional] [default to undefined] |
| **timestamped_at** | **string**                                                                                                                  | Čas vytvorenia časovej pečiatky. | [optional] [default to undefined] |

## Example

```typescript
import { CepVerifiedObjectAuthorizationsInnerTimestamp } from './api'

const instance: CepVerifiedObjectAuthorizationsInnerTimestamp = {
  certificate,
  timestamped_at,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
