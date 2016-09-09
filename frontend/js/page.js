'use strict';

const Game = require('./game');
// const Timer = require('./timer');

class Page {
    constructor(options) {
        this._el = options.element;

        this._game = new Game({
            element: document.querySelector('[data-component="game"]')
        });

        // this._timer = new Timer({
        //     element: document.querySelector('[data-component="timer"]')
        // });

        // this._game.on('gameStarted', this._onGameStart.bind(this));
    }

    _onGameStart(e) {
        // this._timer.start();
    }
}

module.exports = Page;
