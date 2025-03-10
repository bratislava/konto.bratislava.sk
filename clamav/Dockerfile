FROM clamav/clamav:1.4 AS prod

COPY conf/ /etc/clamav/

ARG GIT_COMMIT="undefined"
ENV GIT_COMMIT=$GIT_COMMIT
LABEL org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.source="https://github.com/bratislava/konto.bratislava.sk/tree/master/clamav" \
      org.opencontainers.image.licenses="EUPL-1.2"
