'use strict';

const Game = require('./game');
const Timer = require('./timer');
const Alert = require('./alert');

class Page {
    constructor(options) {
        this._el = options.element;

        this._game = new Game({
            element: document.querySelector('[data-component="game"]')
        });

        this._timer = new Timer({
            element: document.querySelector('[data-component="timer"]')
        });

        this._alert = new Alert({
            element: document.querySelector('[data-component="alert"]')
        });

        this._game.on('gameStarted', this._onGameStart.bind(this));
        this._game.on('gameOver', this._onGameOver.bind(this));
    }

    _onGameStart(e) {
        this._timer.clean();
        this._timer.start();
    }

    _onGameOver(e) {
        let status = e.detail;
        this._timer.stop();

        let alertType = status ? 'success' : 'danger';
        let alertText = status ? 'You won!' : 'You lose!';

        this._alert.render(alertType, alertText);
        this._alert.show();
    }
}

module.exports = Page;
