# NoFileUploadDataErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                                     |
| -------------- | ---------- | ------------------------------------------- | --------------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 400]                                          |
| **message**    | **string** | Detail error message                        | [default to 'No upload data have been passed to backend'] |
| **status**     | **string** | status in text                              | [default to 'Bad request']                                |
| **errorName**  | **string** | Exact error name                            | [default to 'NO_FILE_UPLOAD_DATA_ERROR']                  |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                         |

## Example

```typescript
import { NoFileUploadDataErrorDto } from './api'

const instance: NoFileUploadDataErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
