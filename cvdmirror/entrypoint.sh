#!/bin/bash
set -eo pipefail

CVD_DIR="${CVD_DIR:=/mnt/cvdupdate}"

# Configuration Functions
check_create_config() {
    if [ ! -e $CVD_DIR/config.json ]; then
        echo "Missing CVD configuration. Creating..."
        cvd config set --config $CVD_DIR/config.json --dbdir $CVD_DIR/database --logdir $CVD_DIR/logs
        echo "CVD configuration created..."
    else
        echo "CVD configuration found..."
    fi

    if [ ! -e $CVD_DIR/database ]; then
      echo "Creating $CVD_DIR/database folder"
      mkdir -p $CVD_DIR/database
    else
      echo "$CVD_DIR/database folder found"
    fi
}

show_config() {
    echo "CVD-Update configuration..."
    cvd config show --config $CVD_DIR/config.json
    echo "Current contents in $CVD_DIR/database directory..."
    ls -al $CVD_DIR/database
}

# CVD Database Functions
create_update_database() {
    check_create_config
    show_config
    update_database
}

serve_database() {
    if [ ! -e $CVD_DIR/database ]; then
        echo "CVD database is missing..."
        exit 1
    fi

    echo "Hosting ClamAV Database..."
    if [ -e /mnt/Caddyfile ]; then
        echo "Using mounted Caddyfile config..."
        exec caddy run --config /mnt/Caddyfile --adapter caddyfile
    else
        echo "Using provided Caddyfile config..."
        # exec caddy file-server --listen :8080 --browse --root $CVD_DIR/database
        exec caddy run --config ./Caddyfile --adapter caddyfile --resume
    fi
}

update_database() {
    echo "Updating ClamAV Database..."
    cvd update --config $CVD_DIR/config.json
    echo "ClamAV Database updated..."
}

usage_fail() {
    echo "Usage: $0 {status|serve|update}"
    exit 1
}

# Argument Check
if [ $# -ne 1 ]; then
    usage_fail
fi

# Argument Handler
case "$1" in
status)
    check_config
    show_config
;;

serve)
    create_update_database
    /usr/sbin/crond -b -L /var/log/cron.log
    serve_database
;;

update)
    create_update_database
;;

*)
    echo "Invalid option: $1"
    usage_fail
esac
