# HealthcheckApi

All URIs are relative to _http://localhost:3000_

| Method                                              | HTTP request         | Description  |
| --------------------------------------------------- | -------------------- | ------------ |
| [**appControllerGetHello**](#appcontrollergethello) | **GET** /healthcheck | Hello world! |

# **appControllerGetHello**

> object appControllerGetHello()

See if nest is working!

### Example

```typescript
import { HealthcheckApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new HealthcheckApi(configuration)

const { status, data } = await apiInstance.appControllerGetHello()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
