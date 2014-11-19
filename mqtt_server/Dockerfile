FROM ubuntu:trusty

ENV NODE_VERSION 0.10.33
ENV NODE_BIN_DIR /usr/local/bin
ENV MQTT_SERVER_DIR /usr/local/lib/mqtt_server
ENV RUN_SCRIPT_PATH /scripts/run.sh

# update software registry and install wget and git
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -y install wget git

# clone the mqtt_server repo
RUN mkdir ${MQTT_SERVER_DIR} &&\
    git clone https://github.com/robotoilet/mqtt_server.git ${MQTT_SERVER_DIR}

# download and install node/npm
RUN wget http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz && \
    tar xfz node-v${NODE_VERSION}-linux-x64.tar.gz &&\
    rm node-v${NODE_VERSION}-linux-x64.tar.gz &&\
    cd node-v${NODE_VERSION}-linux-x64 &&\
    ln -s $PWD/bin/node ${NODE_BIN_DIR}/node &&\
    ln -s $PWD/bin/npm ${NODE_BIN_DIR}/npm

# upload the run script
ADD run.sh ${RUN_SCRIPT_PATH}
RUN chmod +x ${RUN_SCRIPT_PATH}

# expose the mqtt api
EXPOSE 1883

# TODO: set up https?

# TODO: set up ssh?

# TODO: define the shared volume (?)

# run the thing
CMD ${RUN_SCRIPT_PATH}
