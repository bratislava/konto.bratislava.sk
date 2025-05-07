# NotFoundErrorDto

## Properties

| Name           | Type       | Description                                 | Notes                             |
| -------------- | ---------- | ------------------------------------------- | --------------------------------- |
| **statusCode** | **number** | Status Code                                 | [default to 404]                  |
| **message**    | **string** | Detail error message                        | [default to undefined]            |
| **status**     | **string** | status in text                              | [default to 'Not found']          |
| **errorName**  | **string** | Exact error name                            | [default to undefined]            |
| **object**     | **object** | Helper for sending additional data in error | [optional] [default to undefined] |

## Example

```typescript
import { NotFoundErrorDto } from './api'

const instance: NotFoundErrorDto = {
  statusCode,
  message,
  status,
  errorName,
  object,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
