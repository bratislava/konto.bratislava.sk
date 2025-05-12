# FilesApi

All URIs are relative to _http://localhost:3000_

| Method                                                                                    | HTTP request                            | Description                                     |
| ----------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| [**filesControllerDownloadFile**](#filescontrollerdownloadfile)                           | **GET** /files/download/file/{jwtToken} | Download file by jwt token                      |
| [**filesControllerDownloadToken**](#filescontrollerdownloadtoken)                         | **GET** /files/download/jwt/{fileId}    | Obtain jwt token form file download             |
| [**filesControllerGetFilesStatusByForm**](#filescontrollergetfilesstatusbyform)           | **GET** /files/forms/{formId}           | List of files and statuses based on formId      |
| [**filesControllerUpdateFileStatusScannerId**](#filescontrollerupdatefilestatusscannerid) | **PATCH** /files/scan/{scannerId}       | Endpoint for updating file status from scanner. |
| [**filesControllerUploadFile**](#filescontrolleruploadfile)                               | **POST** /files/upload/{formId}         | Upload file to form                             |

# **filesControllerDownloadFile**

> filesControllerDownloadFile()

You can download file byt fileId.

### Example

```typescript
import { FilesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new FilesApi(configuration)

let jwtToken: string // (default to undefined)

const { status, data } = await apiInstance.filesControllerDownloadFile(jwtToken)
```

### Parameters

| Name         | Type         | Description | Notes                 |
| ------------ | ------------ | ----------- | --------------------- |
| **jwtToken** | [**string**] |             | defaults to undefined |

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/octet-stream

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | Filestream as output. | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerDownloadToken**

> DownloadTokenResponseDataDto filesControllerDownloadToken()

To be able to download file you need to obtain jwt token.

### Example

```typescript
import { FilesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new FilesApi(configuration)

let fileId: string // (default to undefined)

const { status, data } = await apiInstance.filesControllerDownloadToken(fileId)
```

### Parameters

| Name       | Type         | Description | Notes                 |
| ---------- | ------------ | ----------- | --------------------- |
| **fileId** | [**string**] |             | defaults to undefined |

### Return type

**DownloadTokenResponseDataDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerGetFilesStatusByForm**

> Array<GetFileResponseReducedDto> filesControllerGetFilesStatusByForm()

If you need list of files and their file statuses based on formId.

### Example

```typescript
import { FilesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new FilesApi(configuration)

let formId: string // (default to undefined)

const { status, data } = await apiInstance.filesControllerGetFilesStatusByForm(formId)
```

### Parameters

| Name       | Type         | Description | Notes                 |
| ---------- | ------------ | ----------- | --------------------- |
| **formId** | [**string**] |             | defaults to undefined |

### Return type

**Array<GetFileResponseReducedDto>**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

### HTTP response details

| Status code | Description                      | Response headers |
| ----------- | -------------------------------- | ---------------- |
| **200**     | List of files and their statuses | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerUpdateFileStatusScannerId**

> UpdateFileStatusResponseDto filesControllerUpdateFileStatusScannerId(updateFileStatusRequestDto)

You have to provide scannerId and status which you want to update. Service will return updated file with status saying that file was updated. If not then proper error will be propagated.

### Example

```typescript
import { FilesApi, Configuration, UpdateFileStatusRequestDto } from './api'

const configuration = new Configuration()
const apiInstance = new FilesApi(configuration)

let scannerId: string // (default to undefined)
let updateFileStatusRequestDto: UpdateFileStatusRequestDto //

const { status, data } = await apiInstance.filesControllerUpdateFileStatusScannerId(
  scannerId,
  updateFileStatusRequestDto,
)
```

### Parameters

| Name                           | Type                           | Description | Notes                 |
| ------------------------------ | ------------------------------ | ----------- | --------------------- |
| **updateFileStatusRequestDto** | **UpdateFileStatusRequestDto** |             |                       |
| **scannerId**                  | [**string**]                   |             | defaults to undefined |

### Return type

**UpdateFileStatusResponseDto**

### Authorization

[bearer](../README.md#bearer), [basic](../README.md#basic)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

### HTTP response details

| Status code | Description                      | Response headers |
| ----------- | -------------------------------- | ---------------- |
| **200**     | Successfully updated file status | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **filesControllerUploadFile**

> PostFileResponseDto filesControllerUploadFile()

You can upload file to form.

### Example

```typescript
import { FilesApi, Configuration } from './api'

const configuration = new Configuration()
const apiInstance = new FilesApi(configuration)

let formId: string // (default to undefined)
let file: File // (optional) (default to undefined)
let filename: string // (optional) (default to undefined)
let id: string // (optional) (default to undefined)

const { status, data } = await apiInstance.filesControllerUploadFile(formId, file, filename, id)
```

### Parameters

| Name         | Type         | Description | Notes                            |
| ------------ | ------------ | ----------- | -------------------------------- |
| **formId**   | [**string**] |             | defaults to undefined            |
| **file**     | [**File**]   |             | (optional) defaults to undefined |
| **filename** | [**string**] |             | (optional) defaults to undefined |
| **id**       | [**string**] |             | (optional) defaults to undefined |

### Return type

**PostFileResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

- **Content-Type**: multipart/form-data
- **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     |             | -                |
| **201**     |             | -                |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
