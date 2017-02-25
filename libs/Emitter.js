"use strict";

const extend = require('extend');

class Emitter {

    constructor(app, config) {
        this.app = app;

        this.config = {};
        extend(true, this.config, Emitter.defaultConfig(), config);

        this.setup();
    }

    static defaultConfig() {
        return {};
    }

    /**
     * Setup
     */
    setup() {
        this.app.on("log received", (message, from) => {
            this.onMessage(message, from);
        });
    }

    /**
     * Send the message to the queue
     * @param message
     * @param from
     */
    onMessage(message, from) {

    }

}

module.exports = Emitter;