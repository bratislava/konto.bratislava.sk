#!/usr/bin/env /bin/sh

if [ "$(echo PING | nc 127.0.0.1 3310)" = "PONG" ]; then
	echo "ping successful"
else
	echo "ping failed"
	exit 1
fi