# ConvertToPdfRequestDto

## Properties

| Name            | Type                                                                           | Description                                                                   | Notes                             |
| --------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------- |
| **formId**      | **string**                                                                     | Form id                                                                       | [default to undefined]            |
| **jsonData**    | **object**                                                                     | Form values in JSON                                                           | [optional] [default to undefined] |
| **clientFiles** | [**Array&lt;SimplifiedClientFileInfoDto&gt;**](SimplifiedClientFileInfoDto.md) | Used only in the FE requests to display files not yet uploaded to the server. | [optional] [default to undefined] |

## Example

```typescript
import { ConvertToPdfRequestDto } from './api'

const instance: ConvertToPdfRequestDto = {
  formId,
  jsonData,
  clientFiles,
}
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
