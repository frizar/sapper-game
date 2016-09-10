'use strict';

const BaseComponent = require('./baseComponent');
const compiledTemplate = require('../templates/config.hbs');

class Config extends BaseComponent {
    constructor(options) {
        super(options.element);

        this._list = [];

        this.on('change', this._onChange.bind(this), '[data-element="game-type-select"]');
    }

    render() {
        this._el.innerHTML = compiledTemplate({
            list: this._list
        });
    }

    setList(list) {
        this._list = JSON.parse(JSON.stringify(list));
    }

    _onChange(e) {
        let difficulty = this._el.querySelector('[data-element="game-type-select"]').value;

        this.trigger('configChanged', difficulty);
    }
}

module.exports = Config;
