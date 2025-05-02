# FilesControllerUploadFile500Response

## Properties

| Name           | Type       | Description                                 | Notes                                               |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 500]                                    |
| **message**    | **string** | Detail error message                        | [default to 'Scanner client returned no response.'] |
| **status**     | **string** | status in text                              | [default to 'Internal server error']                |
| **errorName**  | **string** | Exact error name                            | [default to 'SCANNER_NO_RESPONSE_ERROR']            |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                   |

## Example

```typescript
import { FilesControllerUploadFile500Response } from './api'

const instance: FilesControllerUploadFile500Response = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
