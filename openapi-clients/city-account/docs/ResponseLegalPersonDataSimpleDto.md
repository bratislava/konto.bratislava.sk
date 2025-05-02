# ResponseLegalPersonDataSimpleDto

## Properties

| Name            | Type       | Description                                                                                                | Notes                                               |
| --------------- | ---------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **id**          | **string** | Local ID of user                                                                                           | [default to '133e0473-44da-407a-b24f-12da343e808d'] |
| **createdAt**   | **string** | Created timestamp                                                                                          | [default to 2023-02-10T10:31:49.247Z]               |
| **updatedAt**   | **string** | Last updated timestamp                                                                                     | [default to 2023-02-10T10:31:49.247Z]               |
| **externalId**  | **string** | Id from cognito, it is not required. We can have also only subscribed user, who are not city account users | [default to 'e51754f2-3367-43f6-b9bc-b5c6131b041a'] |
| **ico**         | **string** | Ico of company, which this user represents                                                                 | [default to '000000']                               |
| **email**       | **string** | Email                                                                                                      | [default to 'test@bratislava.sk']                   |
| **birthNumber** | **string** | Birth number                                                                                               | [default to '9909090000']                           |

## Example

```typescript
import { ResponseLegalPersonDataSimpleDto } from './api'

const instance: ResponseLegalPersonDataSimpleDto = {
  id,
  createdAt,
  updatedAt,
  externalId,
  ico,
  email,
  birthNumber,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
