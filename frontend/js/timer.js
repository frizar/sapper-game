'use strict';

const BaseComponent = require('./baseComponent');
const compiledTemplate = require('../templates/timer.hbs');

class Timer extends BaseComponent {
    constructor(options) {
        super(options.element);

        this._seconds = 0;
        this.render();
    }

    render() {
        this._el.innerHTML = compiledTemplate({
            seconds: this._seconds
        });
    }

    start() {
        this._timer = setInterval(() => {
            this._seconds++;
            this.render();
        }, 1000);
    }

    stop() {
        clearInterval(this._timer);
    }

    clean() {
        this.stop();
        this._seconds = 0;
        this.render();
    }

    getSeconds() {
        return this._seconds;
    }
}

module.exports = Timer;
