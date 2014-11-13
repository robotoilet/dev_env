cd ${MQTT_SERVER_DIR}
echo "Installing the distribution module from local source.."
npm install ${DISTRIBUTION_DIR}
echo "Installing the mqtt_server module.."
npm install
echo "Starting the server.."
npm start
