# UniverzlneSynchrnneRozhranieSluiebPVSApi

All URIs are relative to *https://fix.slovensko-sk-api.staging.slovensko.digital*

| Method                        | HTTP request      | Description                           |
| ----------------------------- | ----------------- | ------------------------------------- |
| [**apiUsrPost**](#apiusrpost) | **POST** /api/usr | Vráti odpoveď synchrónnej služby ÚPVS |

# **apiUsrPost**

> string apiUsrPost(apiUsrPostRequest)

Vráti odpoveď synchrónnej služby ÚPVS.

### Example

```typescript
import { UniverzlneSynchrnneRozhranieSluiebPVSApi, Configuration, ApiUsrPostRequest } from './api'

const configuration = new Configuration()
const apiInstance = new UniverzlneSynchrnneRozhranieSluiebPVSApi(configuration)

let accept: string // (default to undefined)
let apiUsrPostRequest: ApiUsrPostRequest //

const { status, data } = await apiInstance.apiUsrPost(accept, apiUsrPostRequest)
```

### Parameters

| Name                  | Type                  | Description | Notes                 |
| --------------------- | --------------------- | ----------- | --------------------- |
| **apiUsrPostRequest** | **ApiUsrPostRequest** |             |                       |
| **accept**            | [**string**]          |             | defaults to undefined |

### Return type

**string**

### Authorization

[API Token](../README.md#API Token)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/xml

### HTTP response details

| Status code | Description                                      | Response headers |
| ----------- | ------------------------------------------------ | ---------------- |
| **200**     | Úspešne vrátená odpoveď synchrónnej služby ÚPVS. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
