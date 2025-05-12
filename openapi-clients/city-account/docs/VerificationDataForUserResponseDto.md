# VerificationDataForUserResponseDto

## Properties

| Name                          | Type                                                                   | Description                                                                         | Notes                  |
| ----------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| **externalId**                | **string**                                                             | Id of the user in cognito.                                                          | [default to undefined] |
| **email**                     | **string**                                                             | Email of the user.                                                                  | [default to undefined] |
| **verificationDataLastMonth** | [**Array&lt;VerificationDataForUser&gt;**](VerificationDataForUser.md) | Verification data for the user in the last month. Ordered by start date descending. | [default to undefined] |

## Example

```typescript
import { VerificationDataForUserResponseDto } from './api'

const instance: VerificationDataForUserResponseDto = {
  externalId,
  email,
  verificationDataLastMonth,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
