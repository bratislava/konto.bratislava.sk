# HealthApi

All URIs are relative to _http://localhost:3000_

| Method                                                            | HTTP request    | Description                  |
| ----------------------------------------------------------------- | --------------- | ---------------------------- |
| [**appControllerGetHello**](#appcontrollergethello)               | **GET** /       | Hello world!                 |
| [**appControllerIsStatusRunning**](#appcontrollerisstatusrunning) | **GET** /health | Check status of this service |

# **appControllerGetHello**

> string appControllerGetHello()

See if nest is working!

### Example

```typescript
import { HealthApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new HealthApi(configuration)

const { status, data } = await apiInstance.appControllerGetHello()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description             | Response headers |
| ----------- | ----------------------- | ---------------- |
| **200**     | Returns a hello message | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **appControllerIsStatusRunning**

> ServiceRunningDto appControllerIsStatusRunning()

This endpoint checks if this service is running

### Example

```typescript
import { HealthApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new HealthApi(configuration)

const { status, data } = await apiInstance.appControllerIsStatusRunning()
```

### Parameters

This endpoint does not have any parameters.

### Return type

**ServiceRunningDto**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description            | Response headers |
| ----------- | ---------------------- | ---------------- |
| **200**     | Service running status | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
