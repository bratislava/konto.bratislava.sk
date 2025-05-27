# DefaultApi

All URIs are relative to _http://localhost:3000_

| Method                                          | HTTP request         | Description |
| ----------------------------------------------- | -------------------- | ----------- |
| [**appControllerHealth**](#appcontrollerhealth) | **GET** /healthcheck | Healthcheck |

# **appControllerHealth**

> appControllerHealth()

See if nest is working!

### Example

```typescript
import { DefaultApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new DefaultApi(configuration)

const { status, data } = await apiInstance.appControllerHealth()
```

### Parameters

This endpoint does not have any parameters.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | Everything is working | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
