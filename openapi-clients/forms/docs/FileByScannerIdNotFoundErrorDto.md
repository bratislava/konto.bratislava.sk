# FileByScannerIdNotFoundErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                                            |
| -------------- | ---------- | ------------------------------------------- | ------------------------------------------------ |
| **statusCode** | **number** | Status Code                                 | [default to 406]                                 |
| **message**    | **string** | Detail error message                        | [default to 'File by scannerId not found.']      |
| **status**     | **string** | status in text                              | [default to 'Not accepted']                      |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_BY_SCANNERID_NOT_FOUND_ERROR'] |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                |

## Example

```typescript
import { FileByScannerIdNotFoundErrorDto } from './api'

const instance: FileByScannerIdNotFoundErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
