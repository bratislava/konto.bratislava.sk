# ApiCepAddTimestampPost200Response

## Properties

| Name                          | Type                    | Description                                                                                          | Notes                             |
| ----------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------- |
| **add_timestamp_result**      | **string**              | Výsledok pridania časovej pečiatky, hodnota &#x60;0&#x60; znamená úspešné pridanie časovej pečiatky. | [optional] [default to undefined] |
| **add_timestamp_description** | **string**              | Popis výsledku.                                                                                      | [optional] [default to undefined] |
| **timestamped_data**          | [**Base64**](Base64.md) | Dáta rozšírené o kvalifikovanú časovú pečiatku.                                                      | [optional] [default to undefined] |

## Example

```typescript
import { ApiCepAddTimestampPost200Response } from './api'

const instance: ApiCepAddTimestampPost200Response = {
  add_timestamp_result,
  add_timestamp_description,
  timestamped_data,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
