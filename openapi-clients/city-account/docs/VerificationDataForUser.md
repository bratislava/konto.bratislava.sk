# VerificationDataForUser

## Properties

| Name            | Type       | Description                    | Notes                                 |
| --------------- | ---------- | ------------------------------ | ------------------------------------- |
| **userId**      | **string** | Id of the user in cognito.     | [default to undefined]                |
| **birthNumber** | **string** | userBirthNumber                | [default to '8808080000']             |
| **idCard**      | **string** | Id card used for verification. | [default to undefined]                |
| **ico**         | **string** | Ico used for verification.     | [optional] [default to undefined]     |
| **verifyStart** | **string** | Created timestamp              | [default to 2023-02-10T10:31:49.247Z] |

## Example

```typescript
import { VerificationDataForUser } from './api'

const instance: VerificationDataForUser = {
  userId,
  birthNumber,
  idCard,
  ico,
  verifyStart,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
