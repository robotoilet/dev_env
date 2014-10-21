FROM ubuntu:trusty

ENV INFLUX_VERSION 0.8.3
ENV CONFIG_FILE_PATH /config/influxdb_config.toml
ENV RUN_SCRIPT_PATH /scripts/run.sh

# 1. update software registry and install wget
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -y install wget

# 2. download and install influxdb
RUN wget http://s3.amazonaws.com/influxdb/influxdb_${INFLUX_VERSION}_amd64.deb && \
    sudo dpkg -i influxdb_${INFLUX_VERSION}_amd64.deb && \
    rm influxdb_${INFLUX_VERSION}_amd64.deb && \
    # tidy up software repo lists
    rm -rf /var/lib/apt/lists/*

# 3. upload the config file and the run script
ADD influxdb.conf ${CONFIG_FILE_PATH}
ADD run.sh ${RUN_SCRIPT_PATH}
RUN chmod +x ${RUN_SCRIPT_PATH}

# expose the http api
EXPOSE 8086

# TODO: set up https?

# expose the admin server
EXPOSE 8083

# TODO: define the shared volume (?)

# run the thing
CMD ${RUN_SCRIPT_PATH}
