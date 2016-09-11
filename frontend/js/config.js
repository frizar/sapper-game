'use strict';

const BaseComponent = require('./baseComponent');
const compiledTemplate = require('../templates/config.hbs');

class Config extends BaseComponent {
    constructor(options) {
        super(options.element);

        this.render();

        this.on('change', this._onChange.bind(this), '[data-element="game-type-select"]');
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

    _onChange(e, select) {
        this.trigger('difficultyChanged', select.value);
    }
}

module.exports = Config;
