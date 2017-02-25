"use strict";

const BaseEmitter = require('./Emitter');
const winston = require('winston');
const os = require('os');

if (/^win/.test(os.platform())) {
    class Emitter extends BaseEmitter {
        constructor(app, config) {
            super(app, config);
            winston.log("error", "Can't use Kafka on Windows, sorry");
        }
    }
    module.exports = Emitter;
    return;
}

const Kafka = require('node-rdkafka');
const extend = require('extend');

class Emitter extends BaseEmitter {

    constructor(app, config) {
        super(app, config);

        this.client = null;
        this.ready = false;
        this.buffers = [];
        this.topic = null;
        this.connect();
    }

    static defaultConfig() {
        return {
            config: {
                'metadata.broker.list': '127.0.0.1',
                'security.protocol': 'SASL_SSL',
                'ssl.ca.location': '/etc/ssl/certs',
                'api.version.request': 'true',
                'sasl.mechanisms': 'PLAIN',
                'sasl.username': 'username',
                'sasl.password': 'password',
                'dr_cb': false
            },
            topic: "",
            partition: -1
        }
    }

    connect() {
        let config = this.config.config;
        this.client = new Kafka.Producer(config);
        this.client.connect();
        this.client.on("ready", () => {
            this.topic = this.client.Topic(this.config.topic, {
                'request.required.acks': 1
            });

            winston.log('info', `Kafka connected to ${this.config.config['metadata.broker.list']}`);
            this.ready = true;
            if (this.buffers.length) {
                _.each(this.buffers, (data) => {
                    this.client.produce(this.topic, this.config.partition, data.message);
                });
                this.buffers = [];
            }
        });
    }

    onMessage(message, from) {
        if (!this.ready) {
            this.buffers.push({message: message, from: from});
            return;
        }

        this.client.produce(this.topic, this.config.partition, data.message);
    }
}

module.exports = Emitter;