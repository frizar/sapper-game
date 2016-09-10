'use strict';

const BaseComponent = require('./baseComponent');
const compiledTemplate = require('../templates/config.hbs');

class Config extends BaseComponent {
    constructor(options) {
        super(options.element);

        this.render();
    }

    render() {
        this._el.innerHTML = compiledTemplate({
            list: this._list || {}
        });

        this._select = this._el.querySelector('[data-element="game-type-select"]');
    }

    setList(list) {
        this._list = JSON.parse(JSON.stringify(list));
    }

    getValue() {
        return this._select.value;
    }
}

module.exports = Config;
