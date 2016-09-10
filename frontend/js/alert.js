'use strict';

const BaseComponent = require('./baseComponent');
const compiledTemplate = require('../templates/alert.hbs');

class Alert extends BaseComponent {
    constructor(options) {
        super(options.element);
    }

    render(type, text) {
        this._el.innerHTML = compiledTemplate({
            type: type,
            text: text
        });

        this.show();
    }

}

module.exports = Alert;
