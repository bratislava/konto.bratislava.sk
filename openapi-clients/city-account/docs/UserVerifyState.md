# UserVerifyState

## Properties

| Name                            | Type        | Description                                                                                      | Notes                             |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| **externalId**                  | **string**  | Id of given user\&#39;s email, if exists                                                         | [optional] [default to undefined] |
| **type**                        | **string**  | Type of user.                                                                                    | [optional] [default to undefined] |
| **isInDatabase**                | **boolean** | Marks if the user with given email is in database.                                               | [default to undefined]            |
| **isInCognito**                 | **boolean** | Marks if the user with given email is in cognito.                                                | [default to undefined]            |
| **cognitoTier**                 | **string**  | Current cognito tier, marks the status of verifying.                                             | [optional] [default to undefined] |
| **birthNumberAlreadyExists**    | **string**  | If set, then this number was used for verifiying, but is already in our database for other user. | [optional] [default to undefined] |
| **birthNumberIcoAlreadyExists** | **string**  | If set, then this number was used for verifiying, but is already in our database for other user. | [optional] [default to undefined] |
| **isVerified**                  | **boolean** | Marks if the user with given email is verified.                                                  | [default to undefined]            |
| **possibleCause**               | **string**  | Possible cause of the verify error.                                                              | [optional] [default to undefined] |

## Example

```typescript
import { UserVerifyState } from './api'

const instance: UserVerifyState = {
  externalId,
  type,
  isInDatabase,
  isInCognito,
  cognitoTier,
  birthNumberAlreadyExists,
  birthNumberIcoAlreadyExists,
  isVerified,
  possibleCause,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
