# Base image to ubuntu:18.04
FROM ubuntu:18.04

# Author WHO
MAINTAINER jimmy<jimmy92049@gmail.com>

RUN apt-get -y update && \
apt install -y python3-pip && \
pip3 install flask && \
pip3 install pyopenssl

#
ADD cvFinal /tmp/cvFinal



# expose httpd port
EXPOSE 443


