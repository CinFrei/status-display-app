FROM debian:bullseye-slim

# if we wanted to build for another arch
#RUN [ "cross-build-start" ]

ENV DEBIAN_FRONTEND noninteractive
ENV ENABLE_LANDSCAPE_MODE=true

RUN apt-get update
RUN apt-get install -y chromium
RUN apt-get install -y xserver-xorg-core xserver-xorg-video-fbdev x11-xserver-utils libgl1-mesa-dri xserver-xorg-video-vesa xautomation xauth xinit x11vnc feh matchbox-window-manager
RUN apt-get install -y procps gawk dbus-x11 xserver-xorg-video-dummy

# black wallpaper
COPY wallpaper.png /etc/wallpaper.png
# vnc password
COPY vnc_password.txt /etc/vnc_password
RUN chmod 600 /etc/vnc_password

RUN adduser --system --uid 5000 --disabled-password --shell /bin/bash  -q chromium
RUN addgroup chromium tty

# end building for other arch
#RUN [ "cross-build-end" ]

#landscape extension
COPY landscape-extension /extension

COPY start_kiosk.sh /root/start_kiosk.sh

ENTRYPOINT [ "/root/start_kiosk.sh" ]
