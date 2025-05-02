# FilesControllerUploadFile400Response

## Properties

| Name           | Type       | Description                                 | Notes                               |
| -------------- | ---------- | ------------------------------------------- | ----------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 400]                    |
| **message**    | **string** | Detail error message                        | [default to 'File size is zero.']   |
| **status**     | **string** | status in text                              | [default to 'Bad request']          |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_SIZE_ZERO_ERROR'] |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]   |
| **error**      | **string** |                                             | [default to 'Bad Request']          |

## Example

```typescript
import { FilesControllerUploadFile400Response } from './api'

const instance: FilesControllerUploadFile400Response = {
  statusCode,
  message,
  status,
  errorName,
  object,
  error,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
