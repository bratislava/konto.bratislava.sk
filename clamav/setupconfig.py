#!/usr/bin/python3

import os
from os import path

# Init the configs so they can be maintained from outside the container
def init_conf(conffile):
    print(f"Initializing conf file {conffile}")
    if os.path.exists(f"/etc/clamav-custom/{conffile}"):
        os.system(f"cp /etc/clamav-custom/{conffile} /etc/clamav/{conffile}")

init_conf("clamd.conf")
init_conf("freshclam.conf")
