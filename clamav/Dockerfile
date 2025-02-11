# Dockerfile for clamav service
FROM clamav/clamav:1.4 AS prod

# install python3 and pip apk
RUN apk add --no-cache python3

COPY conf/ /etc/clamav-custom
COPY start.py /start.py
COPY setupconfig.py /setupconfig.py
COPY health.sh /health.sh
COPY readiness.sh /readiness.sh
COPY virustest /virustest

RUN chmod +x /readiness.sh
RUN chmod +x /health.sh
RUN chmod +x /setupconfig.py
RUN chmod +x /start.py
RUN chmod +x /init

# run setupconfig.py to setup clamav config
RUN /setupconfig.py

ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/clamav" \
      org.opencontainers.image.licenses="EUPL-1.2"

ENTRYPOINT ["/init"]
