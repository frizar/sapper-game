'use strict';

const BaseComponent = require('./baseComponent');

class Timer extends BaseComponent {
    constructor(options) {
        super(options.element);

        this._seconds = 0;
        this.render();
    }

    render() {
        this._el.innerHTML = this._seconds;
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
        this._seconds = 0;
        this.render();
    }
}

module.exports = Timer;
