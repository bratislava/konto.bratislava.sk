# ClamAV CVDMirror Database for Local Kubernetes Usage

The `cvdmirror` project is a local mirror of the ClamAV virus database, which is used to keep the antivirus scanner up-to-date with the latest virus definitions. We need to have it locally, because the CVD server allows only a few number of requests per day, which will not be enough for our needs.

## Technologies

We use a small Caddy server to serve the CVD files and a simple script to download the files from the ClamAV database. For updating the cvd database we use python tool `cvdupdate` tool.

## Repository Structure

- `Caddyfile`: Configuration file for the Caddy server.
- `entrypoint.sh`: Script to check for updates, download the CVD files and start the Caddy server.
- `Dockerfile`: Used to build the Docker image for the CVDMirror.
- `README.md`: This file, providing an overview and instructions for the project.

## Run locally

To run the Docker container, use

```bash
docker compose up
```

> [!IMPORTANT]
> If you are getting startup or entrypoint errors, make sure file `entrypoint.sh` is using LF line endings on your system.

## Deployment

The service can be deployed to a Kubernetes cluster using the provided configurations in the kubernetes directory. As it needs a persistent CVD data, it is set up as a StatefulSet with a PersistentVolumeClaim. The container contains a Caddy server and in background it runs `cvdupdate` script which is initiated by cron.

## Related Links

- [ClamAV Documentation](https://www.clamav.net/documents)
- [ClamAV Database Mirror](https://database.clamav.net/)
- [Caddy Server Documentation](https://caddyserver.com/docs/)
