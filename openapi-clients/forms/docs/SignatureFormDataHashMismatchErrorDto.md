# SignatureFormDataHashMismatchErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                             |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 422]                                  |
| **message**    | **string** | Detail error message                        | [default to 'Signature form data hash mismatch.'] |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error']         |
| **errorName**  | **string** | Exact error name                            | [default to 'SIGNATURE_FORM_DATA_HASH_MISMATCH']  |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                 |

## Example

```typescript
import { SignatureFormDataHashMismatchErrorDto } from './api'

const instance: SignatureFormDataHashMismatchErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
