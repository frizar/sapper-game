'use strict';

class BaseComponent {
    constructor(element) {
        this._el = element;
    }

    hide() {
        this._el.classList.add('js-hidden');
    }

    show() {
        this._el.classList.remove('js-hidden');
    }

    getElement() {
        return this._el;
    }

    on(eventName, handler, selector) {
        this._el.addEventListener(eventName, (e) => {
            if (selector) {
                let closest = e.target.closest(selector);

                if (!closest || !this._el.contains(closest)) {
                    return;
                }
            }

            handler(e);
        });
    }

    trigger(eventName, data) {
        let customEvent = new CustomEvent(eventName, {
            detail: data
        });

        this._el.dispatchEvent(customEvent);
    }
}

module.exports = BaseComponent;
