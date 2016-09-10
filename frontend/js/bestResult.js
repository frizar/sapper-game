'use strict';

const BaseComponent = require('./baseComponent');
const compiledTemplate = require('../templates/best-result.hbs');

class BestResult extends BaseComponent {
    constructor(options) {
        super(options.element);

        this._bestResult = {};

        this.render();
    }

    render() {
        this._el.innerHTML = compiledTemplate({
            seconds: this._bestResult
        });
    }

    setDefaultValues(values) {
        for (let value in values) {
            if (!values.hasOwnProperty(value)) {
                return;
            }

            this._bestResult[value] = +value || 0;
        }
    }

    updateBestResult(difficulty, seconds) {
        if (seconds < this._bestResult[difficulty] || this._bestResult[difficulty] === 0) {
            this._bestResult[difficulty] = seconds;
        }
    }
}

module.exports = BestResult;
