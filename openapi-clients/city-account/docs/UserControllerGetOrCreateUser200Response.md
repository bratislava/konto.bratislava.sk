# UserControllerGetOrCreateUser200Response

## Properties

| Name                              | Type                                                                                  | Description                                                                                                                                                                                                                                                                                                                                                               | Notes                                               |
| --------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **id**                            | **string**                                                                            | Local ID of user                                                                                                                                                                                                                                                                                                                                                          | [default to '133e0473-44da-407a-b24f-12da343e808d'] |
| **createdAt**                     | **string**                                                                            | Created timestamp                                                                                                                                                                                                                                                                                                                                                         | [default to 2023-02-10T10:31:49.247Z]               |
| **updatedAt**                     | **string**                                                                            | Last updated timestamp                                                                                                                                                                                                                                                                                                                                                    | [default to 2023-02-10T10:31:49.247Z]               |
| **externalId**                    | **string**                                                                            | Id from cognito, it is not required. We can have also only subscribed user, who are not city account users                                                                                                                                                                                                                                                                | [default to 'e51754f2-3367-43f6-b9bc-b5c6131b041a'] |
| **email**                         | **string**                                                                            | Email                                                                                                                                                                                                                                                                                                                                                                     | [default to 'test@bratislava.sk']                   |
| **birthNumber**                   | **string**                                                                            | Birth number                                                                                                                                                                                                                                                                                                                                                              | [default to '9909090000']                           |
| **officialCorrespondenceChannel** | [**UserOfficialCorrespondenceChannelEnum**](UserOfficialCorrespondenceChannelEnum.md) | State, if we can communicate user with email, or user have active e-desk slovensko.sk mail or we need to communicate with him with post. First we are looking for edesk, if he has registered edesk communication in NASES use edesk. If not, check if there is subscription for communication through email, use email from city account. Else use Postal communication. | [default to undefined]                              |
| **wasVerifiedBeforeTaxDeadline**  | **boolean**                                                                           | True if user was registered and have verified birth number until 2024-04-22. This date can be varied every year. In this date, user are sent into Noris and taxes will be generated.                                                                                                                                                                                      | [default to true]                                   |
| **showEmailCommunicationBanner**  | **boolean**                                                                           | Can show banner for formal communication through email? If it was shown and clicked, it will not be shown.                                                                                                                                                                                                                                                                | [default to true]                                   |
| **gdprData**                      | [**Array&lt;ResponseGdprLegalPersonDataDto&gt;**](ResponseGdprLegalPersonDataDto.md)  | Subscription Data in array                                                                                                                                                                                                                                                                                                                                                | [default to undefined]                              |
| **ico**                           | **string**                                                                            | Ico of company, which this user represents                                                                                                                                                                                                                                                                                                                                | [default to '000000']                               |

## Example

```typescript
import { UserControllerGetOrCreateUser200Response } from './api'

const instance: UserControllerGetOrCreateUser200Response = {
  id,
  createdAt,
  updatedAt,
  externalId,
  email,
  birthNumber,
  officialCorrespondenceChannel,
  wasVerifiedBeforeTaxDeadline,
  showEmailCommunicationBanner,
  gdprData,
  ico,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
