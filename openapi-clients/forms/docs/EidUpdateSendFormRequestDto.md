# EidUpdateSendFormRequestDto

## Properties

| Name                 | Type                                        | Description                                                  | Notes                                                    |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| **formDataJson**     | **object**                                  | Send JSON body of form                                       | [optional] [default to undefined]                        |
| **formSignature**    | [**FormSignatureDto**](FormSignatureDto.md) | Form signature with metadata                                 | [optional] [default to undefined]                        |
| **state**            | **object**                                  | State of form                                                | [optional] [default to undefined]                        |
| **formDataGinis**    | **string**                                  | Data from ginis saved in our db                              | [optional] [default to '<XML ...>']                      |
| **finishSubmission** | **string**                                  | Date time, when submission was finished in ginis             | [optional] [default to 2025-06-10T11:57:25.331Z]         |
| **recipientId**      | **string**                                  | ID of person, who is sending this (URI)                      | [optional] [default to 'rc://8808070000/jozko_mrkvicka'] |
| **ginisDocumentId**  | **string**                                  | Ginis document id generated after registering the submission | [optional] [default to 'MAG0X03RZC97']                   |
| **eidToken**         | **string**                                  | EID token to send form                                       | [default to undefined]                                   |

## Example

```typescript
import { EidUpdateSendFormRequestDto } from './api'

const instance: EidUpdateSendFormRequestDto = {
  formDataJson,
  formSignature,
  state,
  formDataGinis,
  finishSubmission,
  recipientId,
  ginisDocumentId,
  eidToken,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
