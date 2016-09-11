'use strict';

const BaseComponent = require('./baseComponent');

class NewGame extends BaseComponent {
    constructor(options) {
        super(options.element);

        this.on('click', this._onClick.bind(this));
    }

    _onClick(e) {
        this.trigger('newGame');
    }
}

module.exports = NewGame;
