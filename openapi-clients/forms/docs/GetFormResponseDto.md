# GetFormResponseDto

## Properties

| Name                   | Type                                        | Description                                                                                        | Notes                                               |
| ---------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **email**              | **string**                                  | Change email, on which you can be contacted                                                        | [default to 'janko.mrkvicka@bratislava.sk']         |
| **id**                 | **string**                                  | Id of record                                                                                       | [default to 'f69559da-5eca-4ed7-80fd-370d09dc3632'] |
| **createdAt**          | **string**                                  | Create date of record                                                                              | [default to 2025-05-12T12:04:42.454Z]               |
| **updatedAt**          | **string**                                  | Update date of record                                                                              | [default to 2025-05-12T12:04:42.454Z]               |
| **externalId**         | **string**                                  | Id of send form from other system, (probably ginis)                                                | [default to '12345']                                |
| **userExternalId**     | **string**                                  | User ID (from cognito) who submit this form, can be empty, if it was submitted by user through eID | [default to 'e5c84a71-5985-40c7-bb19-e4ad22eda41c'] |
| **mainUri**            | **string**                                  | Uri for defining electronic sendbox, if person has it                                              | [default to 'rc://sk/8808080000/jozko_mrkvicka']    |
| **actorUri**           | **string**                                  | Uri for defining electronic sendbox, if person has it                                              | [default to 'rc://sk/8808080000/jozko_mrkvicka']    |
| **state**              | **string**                                  | State of form                                                                                      | [default to StateEnum_Draft]                        |
| **error**              | **string**                                  | Specific error type                                                                                | [default to ErrorEnum_None]                         |
| **formDataGinis**      | **string**                                  | Data from ginis saved in our db                                                                    | [default to '<XML ...>']                            |
| **ginisDocumentId**    | **string**                                  | Ginis document id generated after registering the submission                                       | [default to 'MAG0X03RZC97']                         |
| **formDataJson**       | **object**                                  | Data in JSON format                                                                                | [default to undefined]                              |
| **formSubject**        | **string**                                  | Form subject                                                                                       | [default to undefined]                              |
| **formSignature**      | [**FormSignatureDto**](FormSignatureDto.md) | Form signature with metadata                                                                       | [optional] [default to undefined]                   |
| **senderId**           | **string**                                  | Technical NASES id of sender                                                                       | [default to 'eba_1234']                             |
| **recipientId**        | **string**                                  | Technical NASES id of recipient                                                                    | [default to 'eba_1234']                             |
| **finishSubmission**   | **string**                                  | end of submition                                                                                   | [default to undefined]                              |
| **formDefinitionSlug** | **string**                                  | Slug of the form definition                                                                        | [default to undefined]                              |
| **jsonVersion**        | **string**                                  | JSON version                                                                                       | [default to undefined]                              |

## Example

```typescript
import { GetFormResponseDto } from './api'

const instance: GetFormResponseDto = {
  email,
  id,
  createdAt,
  updatedAt,
  externalId,
  userExternalId,
  mainUri,
  actorUri,
  state,
  error,
  formDataGinis,
  ginisDocumentId,
  formDataJson,
  formSubject,
  formSignature,
  senderId,
  recipientId,
  finishSubmission,
  formDefinitionSlug,
  jsonVersion,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
