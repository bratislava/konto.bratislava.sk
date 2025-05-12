# ScannerApi

All URIs are relative to _http://localhost:3000_

| Method                                                                  | HTTP request                                     | Description                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| [**scannerControllerDeleteFileById**](#scannercontrollerdeletefilebyid) | **DELETE** /api/scan/file/{resourceId}           |                                                  |
| [**scannerControllerGetStatus**](#scannercontrollergetstatus)           | **GET** /api/scan/file/{fileUid64}/{bucketUid64} |                                                  |
| [**scannerControllerGetStatusById**](#scannercontrollergetstatusbyid)   | **GET** /api/scan/file/{resourceId}              |                                                  |
| [**scannerControllerScanFile**](#scannercontrollerscanfile)             | **POST** /api/scan/file                          | Scan list of files in bucket via clamav scanner. |
| [**scannerControllerScanFiles**](#scannercontrollerscanfiles)           | **POST** /api/scan/files                         | Scan list of files in bucket via clamav scanner. |

# **scannerControllerDeleteFileById**

> ScanStatusDto scannerControllerDeleteFileById()

### Example

```typescript
import { ScannerApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ScannerApi(configuration)

let resourceId: string // (default to undefined)

const { status, data } = await apiInstance.scannerControllerDeleteFileById(resourceId)
```

### Parameters

| Name           | Type         | Description | Notes                 |
| -------------- | ------------ | ----------- | --------------------- |
| **resourceId** | [**string**] |             | defaults to undefined |

### Return type

**ScanStatusDto**

### Authorization

[basic](../README.md#basic)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                         | Response headers |
| ----------- | --------------------------------------------------- | ---------------- |
| **200**     | Delete scanned file by record id.                   | -                |
| **400**     | File did or bucket uid contains invalid parameters. | -                |
| **404**     | File not found                                      | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **scannerControllerGetStatus**

> ScanStatusDto scannerControllerGetStatus()

### Example

```typescript
import { ScannerApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ScannerApi(configuration)

let bucketUid64: string // (default to undefined)
let fileUid64: string // (default to undefined)

const { status, data } = await apiInstance.scannerControllerGetStatus(bucketUid64, fileUid64)
```

### Parameters

| Name            | Type         | Description | Notes                 |
| --------------- | ------------ | ----------- | --------------------- |
| **bucketUid64** | [**string**] |             | defaults to undefined |
| **fileUid64**   | [**string**] |             | defaults to undefined |

### Return type

**ScanStatusDto**

### Authorization

[basic](../README.md#basic)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                              | Response headers |
| ----------- | -------------------------------------------------------- | ---------------- |
| **200**     | get status of scanned file. Params are in base64 format. | -                |
| **400**     | File did or bucket uid contains invalid parameters.      | -                |
| **404**     | File or bucket not found                                 | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **scannerControllerGetStatusById**

> ScanStatusDto scannerControllerGetStatusById()

### Example

```typescript
import { ScannerApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ScannerApi(configuration)

let resourceId: string // (default to undefined)

const { status, data } = await apiInstance.scannerControllerGetStatusById(resourceId)
```

### Parameters

| Name           | Type         | Description | Notes                 |
| -------------- | ------------ | ----------- | --------------------- |
| **resourceId** | [**string**] |             | defaults to undefined |

### Return type

**ScanStatusDto**

### Authorization

[basic](../README.md#basic)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                                                                                                                                     | Response headers |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **200**     | Get status of scanned file by record id or by fileUid in base64. When using fileUid (filename) in base64 we will use default bucket as default. | -                |
| **400**     | File did or bucket uid contains invalid parameters.                                                                                             | -                |
| **404**     | File not found                                                                                                                                  | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **scannerControllerScanFile**

> ScanFileResponseDto scannerControllerScanFile(scanFileDto)

You have to provide list of files which are already uploaded to bucket and you want to scan them. Service will return list of files with status saying that files where accepted for scanning. If not then proper error will be propagated.

### Example

```typescript
import { ScannerApi, Configuration, ScanFileDto } from './api'

const configuration = new Configuration()
const apiInstance = new ScannerApi(configuration)

let scanFileDto: ScanFileDto //

const { status, data } = await apiInstance.scannerControllerScanFile(scanFileDto)
```

### Parameters

| Name            | Type            | Description | Notes |
| --------------- | --------------- | ----------- | ----- |
| **scanFileDto** | **ScanFileDto** |             |       |

### Return type

**ScanFileResponseDto**

### Authorization

[basic](../README.md#basic)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                           | Response headers |
| ----------- | ------------------------------------- | ---------------- |
| **202**     | Files has been accepted for scanning. | -                |
| **400**     | Wrong parameters provided.            | -                |
| **404**     | File or bucket not found.             | -                |
| **410**     | File has already been processed.      | -                |
| **413**     | File for scanning is too large.       | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **scannerControllerScanFiles**

> ScanFileResponseDto scannerControllerScanFiles(requestBody)

You have to provide list of files which are already uploaded to bucket and you want to scan them. Service will return list of files with status saying that files where accepted for scanning. If not then proper error will be propagated.

### Example

```typescript
import { ScannerApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new ScannerApi(configuration)

let requestBody: Array<object> //List of files to scan.

const { status, data } = await apiInstance.scannerControllerScanFiles(requestBody)
```

### Parameters

| Name            | Type              | Description            | Notes |
| --------------- | ----------------- | ---------------------- | ----- |
| **requestBody** | **Array<object>** | List of files to scan. |       |

### Return type

**ScanFileResponseDto**

### Authorization

[basic](../README.md#basic)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                           | Response headers |
| ----------- | ------------------------------------- | ---------------- |
| **202**     | Files has been accepted for scanning. | -                |
| **400**     | Wrong parameters provided.            | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
