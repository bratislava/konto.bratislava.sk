# CepVerifiedObjectAuthorizationsInnerVerification

Overenie objektu.

## Properties

| Name            | Type                                                                                                                        | Description                                                                                                                                                                 | Notes                             |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **result**      | **number**                                                                                                                  | Kód výsledku overenia: - &#x60;1&#x60; platná, - &#x60;2&#x60; neplatná, - &#x60;3&#x60; predbežne platná, - &#x60;4&#x60; pravdepodobne platná, - &#x60;5&#x60; neoverená. | [optional] [default to undefined] |
| **description** | **string**                                                                                                                  | Popis výsledku overenia.                                                                                                                                                    | [optional] [default to undefined] |
| **verifier**    | [**CepVerifiedObjectAuthorizationsInnerVerificationVerifier**](CepVerifiedObjectAuthorizationsInnerVerificationVerifier.md) |                                                                                                                                                                             | [optional] [default to undefined] |
| **verified_at** | **string**                                                                                                                  | Čas overenia podpisu.                                                                                                                                                       | [optional] [default to undefined] |

## Example

```typescript
import { CepVerifiedObjectAuthorizationsInnerVerification } from './api'

const instance: CepVerifiedObjectAuthorizationsInnerVerification = {
  result,
  description,
  verifier,
  verified_at,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
