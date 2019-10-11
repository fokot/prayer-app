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

## Domain
`prayer-app.tk` is registered at [freenom.com](https://www.freenom.com)

## Nginx
* I set it up with help of this [article](https://medium.com/@jgefroh/a-guide-to-using-nginx-for-static-websites-d96a9d034940)
* Static files are in `/var/www/prayer-app.tk/`
* Nginx config is in `/etc/nginx/sites-available/prayer-app.tk`
and symlinked to `sites-enabled`
* After making changes to config nginx must be restarted like
```bash
sudo systemctl restart nginx
```

[Privacy policy](https://prayer-app.tk/privacy-policy.html) needs to be online because of play store.

Https is enabled via [letsencrypt](https://letsencrypt.org/) and renewed like
```bash
sudo crontab -e
```
Add the following line:
```bash
17 7 * * * certbot renew --post-hook "systemctl reload nginx"
```
