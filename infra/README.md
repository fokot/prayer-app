# Infra

## Overview
* Web app is hosted on Ubuntu 18.04 machine.
* Nginx serves static files
* Nginx also proxies all `/ws` paths to server app
* Server app runs as systemd daemon with `prayer-app-server.service` config
* Server app for Ubuntu 18.04 can be built with `build-server.sh` script

## Server app
* Systemd config file is `/etc/systemd/system/prayer-app-server.service`
* App file is `/usr/bin/prayer-app-server`
* To start app run
```bash
systemctl start prayer-app-server
```
* To automatically get it to start on boot
```bash
systemctl enable prayer-app-server
```
