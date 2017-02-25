"use strict";

const BaseEmitter = require('./Emitter');
const Redis = require('ioredis');
const extend = require('extend');
const winston = require('winston');
const _ = require('underscore');

class Emitter extends BaseEmitter {

    constructor(app, config) {
        super(app, config);

        this.client = null;
        this.ready = false;
        this.buffers = [];
        this.connect();
    }

    static defaultConfig() {
        return {
            config: {
                port: 6379,
                host: '127.0.0.1',
                family: 4,
                password: 'auth',
                db: 0
            },
            mode: "split",
            channelNamePrefix: "",
            channelName: ""
        }
    }

    connect() {
        let config = this.config.config;
        config.retryStrategy = (times) => {
            return Math.max(Math.min(times * 2, 2000), 20);
        };

        this.client = new Redis(config);
        this.client.on("ready", () => {
            winston.log('info', `Redis connected to ${this.config.config.host}:${this.config.config.port}`)
            this.ready = true;
            if (this.buffers.length) {
                _.each(this.buffers, (data) => {
                    this.client.publish(this.getChannelName(data.from), data);
                });
                this.buffers = [];
            }
        });

        this.client.monitor(function (err, monitor) {
            monitor.on('monitor', function (time, args, source, database) {
                //console.log(time, args, source, database);
            });
        });
    }

    onMessage(message, from) {
        if (!this.ready) {
            this.buffers.push({message: message, from: from});
            return;
        }

        this.client.publish(this.getChannelName(from), {message: message, from: from})
    }

    getChannelName(from) {
        if (this.config.mode == "split") {
            return this.config.channelNamePrefix + from;
        } else {
            return this.config.channelName;
        }
    }
}

module.exports = Emitter;