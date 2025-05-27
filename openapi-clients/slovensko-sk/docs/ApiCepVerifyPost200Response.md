# ApiCepVerifyPost200Response

## Properties

| Name                   | Type                                                                                                                   | Description              | Notes                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------- |
| **verify_result**      | **number**                                                                                                             | Kód výsledku overenia.   | [default to undefined]            |
| **verify_description** | **string**                                                                                                             | Popis výsledku overenia. | [default to undefined]            |
| **verified_objects**   | [**Array&lt;ApiCepVerifyPost200ResponseVerifiedObjectsInner&gt;**](ApiCepVerifyPost200ResponseVerifiedObjectsInner.md) | Overené objekty.         | [optional] [default to undefined] |

## Example

```typescript
import { ApiCepVerifyPost200Response } from './api'

const instance: ApiCepVerifyPost200Response = {
  verify_result,
  verify_description,
  verified_objects,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
