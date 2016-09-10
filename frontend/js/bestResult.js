'use strict';

const BaseComponent = require('./baseComponent');
const compiledTemplate = require('../templates/best-result.hbs');

class BestResult extends BaseComponent {
    constructor(options) {
        super(options.element);

        this._bestResult = 0;

        this.render();
    }

    render() {
        this._el.innerHTML = compiledTemplate({
            seconds: this._bestResult
        });

        this.show();
    }

    updateBestResult(seconds) {
        if (seconds < this._bestResult || this._bestResult === 0) {
            this._bestResult = seconds;
        }
    }
}

module.exports = BestResult;
