"use strict";
const EventEmitter = require('events').EventEmitter;

// UDP Receiver
const dgram = require('dgram');
const winston = require('winston');

// Tools
const _ = require('underscore');

class Application extends EventEmitter {

    constructor(config) {
        super();

        winston.log('info', 'Starting eBot Log Receiver v1.0');
        this.config = config;
        this.emitters = [];

        this.checkConfig();
        this.setup();

        setInterval(() => {
            this.emit("log received", "coucou", "127.0.0.1:27015")
        }, 5000);
    }

    checkConfig() {

    }

    setup() {
        this.setupLogReceiver();
        this.setupEmitters();
    }

    setupLogReceiver() {
        this.server = dgram.createSocket('udp4');

        this.server.on('error', (err) => {
            winston.log('error', `UDP server error:\n${err.stack}\nClosing the server`);
            this.server.close();
            process.exit();
        });

        this.server.on('message', (msg, rinfo) => {
            this.emit("log received", msg, rinfo.address + ":" + rinfo.port);
        });

        this.server.on('listening', () => {
            const address = this.server.address();
            winston.log('info', `UDP Server is listening to ${address.address}:${address.port}`);
        });

        this.server.bind(this.config.port, this.config.ip);
    }

    setupEmitters() {
        winston.log('info', 'Loading emitters');
        _.each(this.config.emitters, emitterConfig => {
            try {
                winston.log('info', 'Loading a ' + emitterConfig.type + ' emitter');
                const emitter = new (require('./libs/' + emitterConfig.type + '.js'))(this, emitterConfig);
            } catch (e) {
                console.log(e);
            }
        });
        winston.log('info', 'Emitters loaded');

    }
}

module.exports = Application;