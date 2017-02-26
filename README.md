# eBot LogReceiver

This is the new way to receive and dispatch the logs from a CSGO server to an eBot Daemon. You can spawn as many LogReceiver in many location your want.

The LogReceiver can dispatch to multiple queue system at once. This system allow to make sure that logs will be dispatched by running the LogReceiver in local.

## Emitters

Emitters are the core of the LogReceiver. This is the way you want to dispatch the logs. You can use one (or many) emitters in the following list:

- Redis
- Apache Kafka
- rabbitmq (in progress)
- Socket.io Server

## Configuration

Just take a look at the config.json.sample file, you will find a sample per emitter type.

## Requirements

- NodeJS (min v6)

For Apache Kafka:
- Linux/Mac with librdkafka installed

## How to install

```bash
git clone https://github.com/deStrO/eBot-LogReceiver.git
cd eBot-LogReceiver
npm install
# edit config.json
node bin/app
```

## Credits

* Julien Pardons (destro@esport-tools.net)

## See also
* [eSport-tools.net website](https://www.esport-tools.net/)
* [eBot-CSGO Project](https://github.com/deStrO/eBot-CSGO)
