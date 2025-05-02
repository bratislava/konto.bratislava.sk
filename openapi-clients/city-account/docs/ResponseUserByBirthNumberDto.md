# ResponseUserByBirthNumberDto

## Properties

| Name                  | Type       | Description                                  | Notes                                               |
| --------------------- | ---------- | -------------------------------------------- | --------------------------------------------------- |
| **birthNumber**       | **string** | userBirthNumber                              | [default to '8808080000']                           |
| **email**             | **string** | email                                        | [default to 'brtaislavcan@bratislava.sk']           |
| **externalId**        | **string** | Cognito Id                                   | [default to 'd18cbd7c-daad-4d5d-a1d7-8e47f845baab'] |
| **userAttribute**     | **object** | Special user attribute for user segmentation | [default to undefined]                              |
| **cognitoAttributes** | **object** | Tier from cognito                            | [optional] [default to undefined]                   |

## Example

```typescript
import { ResponseUserByBirthNumberDto } from './api'

const instance: ResponseUserByBirthNumberDto = {
  birthNumber,
  email,
  externalId,
  userAttribute,
  cognitoAttributes,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
