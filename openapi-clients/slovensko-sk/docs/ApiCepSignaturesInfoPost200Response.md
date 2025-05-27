# ApiCepSignaturesInfoPost200Response

## Properties

| Name            | Type                                                                                                                         | Description                            | Notes                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------- |
| **is_signed**   | **boolean**                                                                                                                  | Výsledok zistenie prítomnosti podpisu. | [default to undefined]            |
| **description** | **string**                                                                                                                   | Popis výsledku.                        | [default to undefined]            |
| **mime_type**   | **string**                                                                                                                   | MimeType podpisovej obálky.            | [optional] [default to undefined] |
| **signatures**  | [**Array&lt;ApiCepSignaturesInfoPost200ResponseSignaturesInner&gt;**](ApiCepSignaturesInfoPost200ResponseSignaturesInner.md) |                                        | [optional] [default to undefined] |

## Example

```typescript
import { ApiCepSignaturesInfoPost200Response } from './api'

const instance: ApiCepSignaturesInfoPost200Response = {
  is_signed,
  description,
  mime_type,
  signatures,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
