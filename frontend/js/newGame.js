'use strict';

const BaseComponent = require('./baseComponent');
const compiledTemplate = require('../templates/new-game.hbs');

class NewGame extends BaseComponent {
    constructor(options) {
        super(options.element);

        this.on('click', this._onClick.bind(this), '[data-element="new-game-button"]');

        this.render();
    }

    render() {
        this._el.innerHTML = compiledTemplate({});
    }

    _onClick(e) {
        this.trigger('newGame');
    }
}

module.exports = NewGame;
