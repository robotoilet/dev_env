CONFIG_FILE_PATH=/config/influxdb_config.toml

echo "Starting InfluxDB.."
exec influxdb -config=${CONFIG_FILE_PATH}

# TODO: change root password?
# TODO: create a robotoilet user with readFrom and writeTo permissions
# TODO: set up https?
