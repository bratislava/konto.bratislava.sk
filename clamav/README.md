# ClamAV

## Overview

This repository contains a containerized ClamAV antivirus scanner service designed for backend deployments.

- Base Image: ClamAV 1.4
- Networking: TCP socket on port 3310

## Configuration

### ClamAV Configuration

The service uses custom configuration files located in the `conf/` directory:

- `clamd.conf`: Configures the ClamAV daemon
  - Supports extensive logging
  - Configurable scan size limits
- `freshclam.conf`: Manages virus signature database updates, important is the location of the database mirror which is our local cvdmirror in kubernetes <http://clamav-cvdmirror-database:8080>

### Run locally

1. **Prerequisite** - running `cvdmirror` -> in directory `/cvdmirror` run

   ```bash
   docker compose up
   ```

2. Afterwards, run this service using docker compose in this `/clamav` directory:

   ```bash
   docker compose up
   ```

   > [!IMPORTANT]
   >
   > - on an Apple silicon ARM architecture processor `docker compose up` can cause an error - try forcing x86 platform by running
   >
   >   ```bash
   >   DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose up
   >   ```
   >
   > - if you are getting configuration errors, make sure files `conf/` are using LF line endings on your system

> [!NOTE]
> If the clamav isn't running properly (it stays in status `starting` or `unhealthy`), try killing it and starting again. 2-3 times should be sufficient.

## Virus Testing

Sample virus test files are included inside of zip file `virus-test-inside.zip`, which is `AES-256` encrypted and password protected. The archive itself is safe, the test virus files (`virtustest` and `virustest.pdf`) are inside and available after unzipping using password `Virus123`.

> [!WARNING]
> After unzipping, these files can trigger your antivirus software - be calm, they're harmless. The detected virus might look like this: `Virus:DOS/EICAR_Test_File`

This is also the reason why the test files are kept zipped and encrypted - so your antivirus doesn't freak out during regular development and basic git actions including but not limited to pulling, merging and rebasing.
