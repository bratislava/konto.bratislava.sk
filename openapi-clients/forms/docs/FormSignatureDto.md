# FormSignatureDto

## Properties

| Name                | Type       | Description              | Notes                  |
| ------------------- | ---------- | ------------------------ | ---------------------- |
| **signatureBase64** | **string** | Base64 encoded signature | [default to undefined] |
| **pospID**          | **string** | POSP ID of the form      | [default to undefined] |
| **pospVersion**     | **string** | POSP version of the form | [default to undefined] |
| **jsonVersion**     | **string** | JSON version of the form | [default to undefined] |
| **formDataHash**    | **string** | Hash of the form data    | [default to undefined] |

## Example

```typescript
import { FormSignatureDto } from './api'

const instance: FormSignatureDto = {
  signatureBase64,
  pospID,
  pospVersion,
  jsonVersion,
  formDataHash,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
