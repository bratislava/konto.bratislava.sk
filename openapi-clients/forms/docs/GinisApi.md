# GinisApi

All URIs are relative to _http://localhost:3000_

| Method                                                                                  | HTTP request            | Description |
| --------------------------------------------------------------------------------------- | ----------------------- | ----------- |
| [**ginisControllerGetGinisDocumentByFormId**](#giniscontrollergetginisdocumentbyformid) | **GET** /ginis/{formId} |             |

# **ginisControllerGetGinisDocumentByFormId**

> GinisDocumentDetailResponseDto ginisControllerGetGinisDocumentByFormId()

Return GINIS document by ID

### Example

```typescript
import { GinisApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new GinisApi(configuration)

let formId: string // (default to undefined)

const { status, data } = await apiInstance.ginisControllerGetGinisDocumentByFormId(formId)
```

### Parameters

| Name       | Type         | Description | Notes                 |
| ---------- | ------------ | ----------- | --------------------- |
| **formId** | [**string**] |             | defaults to undefined |

### Return type

**GinisDocumentDetailResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description            | Response headers |
| ----------- | ---------------------- | ---------------- |
| **200**     |                        | -                |
| **401**     | Unauthorized.          | -                |
| **403**     | Form is Forbidden.     | -                |
| **404**     | Form not found.        | -                |
| **500**     | Internal server error. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
