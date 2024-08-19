# Dockerfile for clamav service
FROM clamav/clamav:0.104.2 AS prod

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

ENTRYPOINT ["/init"]