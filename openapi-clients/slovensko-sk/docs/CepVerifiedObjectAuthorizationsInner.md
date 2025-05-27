# CepVerifiedObjectAuthorizationsInner

## Properties

| Name             | Type                                                                                                        | Description        | Notes                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------- |
| **signature**    | [**CepVerifiedObjectAuthorizationsInnerSignature**](CepVerifiedObjectAuthorizationsInnerSignature.md)       |                    | [optional] [default to undefined] |
| **timestamp**    | [**CepVerifiedObjectAuthorizationsInnerTimestamp**](CepVerifiedObjectAuthorizationsInnerTimestamp.md)       |                    | [optional] [default to undefined] |
| **verification** | [**CepVerifiedObjectAuthorizationsInnerVerification**](CepVerifiedObjectAuthorizationsInnerVerification.md) |                    | [optional] [default to undefined] |
| **objects**      | **Array&lt;object&gt;**                                                                                     | Podpísané objekty. | [optional] [default to undefined] |

## Example

```typescript
import { CepVerifiedObjectAuthorizationsInner } from './api'

const instance: CepVerifiedObjectAuthorizationsInner = {
  signature,
  timestamp,
  verification,
  objects,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
