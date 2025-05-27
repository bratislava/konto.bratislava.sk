# FormUserInformationDto

## Properties

| Name               | Type       | Description                                                                                        | Notes                                               |
| ------------------ | ---------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **userExternalId** | **string** | User ID (from cognito) who submit this form, can be empty, if it was submitted by user through eID | [default to 'e5c84a71-5985-40c7-bb19-e4ad22eda41c'] |
| **mainUri**        | **string** | Uri for defining electronic sendbox, if person has it                                              | [default to 'rc://sk/8808080000/jozko_mrkvicka']    |
| **actorUri**       | **string** | Uri for defining electronic sendbox, if person has it                                              | [default to 'rc://sk/8808080000/jozko_mrkvicka']    |

## Example

```typescript
import { FormUserInformationDto } from './api'

const instance: FormUserInformationDto = {
  userExternalId,
  mainUri,
  actorUri,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
