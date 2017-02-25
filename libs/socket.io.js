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
                url: 'http://localhost'
            },
            eventName: "ebot logs"
        }
    }

    connect() {
        this.client = require('socket.io-client')(this.config.config.url);
        this.client.on('connect', function () {
            winston.log('info', `Socket.io connected to ${this.config.config.url}`)

            this.ready = true;
            if (this.buffers.length) {
                _.each(this.buffers, (data) => {
                    this.client.emit(this.config.eventName, data.from, data.message)
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

        this.client.emit(this.config.eventName, from, message)
    }

}

module.exports = Emitter;