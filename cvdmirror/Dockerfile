FROM docker.io/python:3.9-alpine AS prod

ENV PYTHONUNBUFFERED 1
WORKDIR /opt/app-root/src

# Install Bash and Caddy
RUN apk add --no-cache bash caddy \
 && rm -rf /var/cache/apk/*

# Install CVD-Update
RUN pip install --no-cache-dir cvdupdate

# Copy configuration and scripts
COPY Caddyfile health.sh entrypoint.sh ./

# Set permissions and setup cron job
RUN chmod +x ./health.sh ./entrypoint.sh \
    && echo '0 */4 * * * /opt/app-root/src/entrypoint.sh update' >> /etc/crontabs/root

ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/cvdmirror" \
      org.opencontainers.image.licenses="EUPL-1.2"

# Start Server
EXPOSE 8080
