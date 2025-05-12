# NasesControllerUpdateForm500Response

## Properties

| Name           | Type       | Description                                 | Notes                                                          |
| -------------- | ---------- | ------------------------------------------- | -------------------------------------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 422]                                               |
| **message**    | **string** | Detail error message                        | [default to 'We were unable to delete file from minio']        |
| **status**     | **string** | status in text                              | [default to 'Unprocessable entity error']                      |
| **errorName**  | **string** | Exact error name                            | [default to 'FILE_DELETE_FROM_MINIO_WAS_NOT_SUCCESSFUL_ERROR'] |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined]                              |

## Example

```typescript
import { NasesControllerUpdateForm500Response } from './api'

const instance: NasesControllerUpdateForm500Response = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
