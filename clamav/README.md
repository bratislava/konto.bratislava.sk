# ClamAV

## Overview

This repository contains a containerized ClamAV antivirus scanner service designed for backend deployments.

## Technology Stack

- Base Image: ClamAV 1.4
- Language: Python 3
- Networking: TCP socket on port 3310

## Configuration

### ClamAV Configuration

The service uses custom configuration files located in the `conf/` directory:

- `clamd.conf`: Configures the ClamAV daemon
  - Supports extensive logging
  - Configurable scan size limits
- `freshclam.conf`: Manages virus signature database updates, important is the location of the database mirror which is our local cvdmirror in kubernetes <http://clamav-cvdmirror-database:8080>

### Docker Compose

Run the service using Docker Compose:

```bash
docker-compose up
```

but you need to change the cvd mirror to a different url or spin via `docker-compose up` in the `cvdmirror` directory

## Key Scripts

- `start.py`: Initializes configuration and starts ClamAV services, lods the cvd database from the cvd mirror and start clamd service
- `setupconfig.py`: Copies custom configurations from the `/conf` directory
- `health.sh`: Performs health checks (used in Kubernetes)
- `readiness.sh`: Verifies ClamAV is running correctly (used in Kubernetes)

## Virus Testing

A sample virus test file is included (`virustest`) to verify antivirus functionality. Used by clamav for readiness probe.

⚠️ it can trigger your antivirus software, be calm

## Logging

- Log files stored in `/var/log/clamav/`
