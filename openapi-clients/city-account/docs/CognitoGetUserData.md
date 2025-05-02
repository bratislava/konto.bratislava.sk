# CognitoGetUserData

## Properties

| Name                     | Type        | Description                        | Notes                                               |
| ------------------------ | ----------- | ---------------------------------- | --------------------------------------------------- |
| **sub**                  | **string**  | Id from cognito                    | [default to '9e7791b2-787b-4b93-8473-94a70a516025'] |
| **email_verified**       | **string**  | Is email verified in cognito?      | [optional] [default to 'true']                      |
| **name**                 | **string**  | Usually name of the company        | [optional] [default to undefined]                   |
| **custom_tier**          | **object**  | Which type of verified tier it is? | [optional] [default to undefined]                   |
| **custom_account_type**  | **string**  | Which type of account it is?       | [default to CustomAccountTypeEnum_Fo]               |
| **given_name**           | **string**  | First name                         | [optional] [default to 'Jožko']                     |
| **family_name**          | **string**  | Last name                          | [optional] [default to 'Bratislavský']              |
| **email**                | **string**  | email                              | [default to 'janko.bratislavsky@bratislava.sk']     |
| **idUser**               | **string**  | User Id from cognito, same as sub  | [default to '9e7791b2-787b-4b93-8473-94a70a516025'] |
| **UserCreateDate**       | **string**  | User create date                   | [optional] [default to undefined]                   |
| **UserLastModifiedDate** | **string**  | User updated date                  | [optional] [default to undefined]                   |
| **Enabled**              | **boolean** | Is user enabled?                   | [default to true]                                   |
| **UserStatus**           | **string**  | Cognito confirmation statue        | [optional] [default to UserStatusEnum_Confirmed]    |

## Example

```typescript
import { CognitoGetUserData } from './api'

const instance: CognitoGetUserData = {
  sub,
  email_verified,
  name,
  custom_tier,
  custom_account_type,
  given_name,
  family_name,
  email,
  idUser,
  UserCreateDate,
  UserLastModifiedDate,
  Enabled,
  UserStatus,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
