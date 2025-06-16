# nest-clamav-scanner

Backend utility responsible for handling requests for files needed to be scanned. It uses ClamAV interface to scan files. As a file storage we use our minio bucket storage.

## How it works

It has two main parts: Endpoints where new files are added to the queue for the scanning. And a DB queue run by regular cron jobs.

### DB structure

We have a table `Files` where we store all the files sent to nest-clamav-scanner. Have a look at the structure in the `schema.prisma` file. The most important part is `FileStatus` enum.

Let`s have a look at the status of the file:

- `ACCEPTED` - When you hit the endpoint which accepts the file for scanning and all checks are passed, this status is set.
- `QUEUED` - File was picked by cron job worker and was put into scan queue.
- `SCANNING` - File is currently being scanned by ClamAV service
- `SAFE` - When a response from scanner was ok, then SAFE status is set to file.
- `INFECTED` - When a response from scanner was something else, then INFECTED status is set to file.
- `NOT_FOUND` - When we are sending file to clamav it can happen it was already deleted from minio and therefore we set this status to file.
- `MOVE_ERROR_SAFE` - When file was successfully scanned without virus, it is moved to safe bucket. If this operation fails, we set this status to file.
- `MOVE_ERROR_INFECTED` - When file was scanned and virus was found, it is moved to infected bucket. If this operation fails, we set this status to file.
- `SCAN_ERROR` - ClamAV can produce also some errors, so we set this status to knew there was some problem.
- `SCAN_TIMEOUT` - Also ClamAV service can timeout, so we set this status.
- `SCAN_NOT_SUCCESSFUL` - After number of tries we get some clamav errors, we set this final status to file.
- `FORM_ID_NOT_FOUND` - files are bond to forms, and after updating the scan status, we are notifying the form about the result. If the form is not found, we set this status to file.

### Endpoints

In `/src/scanner/scanner.controller` we have some important endpoints which are primarily used for the communication with the service.

- `POST /api/scan/file` which saves a file to the database and sets the status to `ACCEPTED` if all conditions are met (like a file is available in minio).
- `POST /api/scan/files` similar to the previous one, but it accepts multiple files in an array.
- `GET /api/scan/file/{scannerId}` returns the file status and data by provided scanner id
- `DELETE /api/scan/file/{scannerId}` deletes the file from the database and minio storage.

### Cron worker

In `/src/scanner-cron/scanner-cron.service` we have a cron worker which is responsible for picking files from the database and sending them to the ClamAV service.
It runs every 20s. In the console there is quite a lot of logging, so you can see what is happening. It checks if there is a older cron scanner process already running. If so, it skips the run and falls asleep.

If `clamAV` is not running, it will pause the scanning process until it is back online.

If there is no process running it checks if `nest-forms-backend` is online. It is necessary for updating the file statuses and if forms is not running scanner will pause scanning after the forms are back online. If `nest-forms-backend` are running and there are some files which status was not sent to `nest-forms-backend`, it will initiate the process of sending the status.

After checking the online status of `nest-forms-backed` it look if there are some files that ended in error state. If it is possible to send them again for scanning, it will start scanning them. After max number of retries it will set the final status `SCAN_NOT_SUCCESSFUL`.

If there are no error files in the database of files, it will have a look if there are some files stuck in the middle of process (like due `nest-clamav-scanner` was turned down in the middle of scanning of batch of files). It will search for files in the statuses `QUEUED`, `SCANNING`, `SCAN_ERROR`, `SCAN_TIMEOUT` and will try to send them again for scanning.

Finally if there are no error files and no stuck files, it will search for files in the status `ACCEPTED` and will send them for scanning.

If the scanning result is `SAFE`, `INFECTED`, `MOVE ERROR INFECTED`, `MOVE ERROR SAFE` or `NOT FOUND`, this status will be sent to `nest-forms-backend` as it is final state of the file.

## Run locally

If you want to run an application without installing it locally quickly, you can run it through `docker compose`.

1. You need to have `clamav` running first. To do that, in directories `/cvdmirror` and `/clamav` (in this order) run

   ```bash
   docker compose up
   ```

   > in case of any problems or errors, follow _Run locally_ section in respective README

2. Copy and adjust `.env` from `.env.example`, and populate secrets you need (mainly `MINIO_SECRET_KEY`)

3. In this `/nest-clamav-scanner` directory, run

   ```bash
   docker compose up
   ```

   This command will initially build the image and run the container with the app. You can access the app on `http://localhost:3000`.

## Local installation

- Run npm installation for dependencies

  ```bash
  npm install
  ```

- For Prisma, it comes in handy to have Prisma cli. Check if it is working on your pc:

  ```bash
  npx prisma
  ```

- Check the `.env` file for your correct local database connection configuration. It looks like this:

  ```env
  DATABASE_URL="postgresql://user:pass@localhost:54302/mydb?schema=public"
  ```

If you have issues connecting to your Postgres, maybe you need to set timeout `connect_timeout`. Sometimes macs have
problems with that:

```env
DATABASE_URL="postgresql://user:pass@localhost:54302/mydb?connect_timeout=30&schema=public"
```

### Starting the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

To run tests in the repo, please use these commands:

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Stay in touch

- Website - [https://inovacie.bratislava.sk/](https://inovacie.bratislava.sk/)
