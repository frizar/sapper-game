'use strict';

const Game = require('./game');
const Timer = require('./timer');
const Alert = require('./alert');
const BestResult = require('./bestResult');
const NewGame = require('./newGame');
const Config = require('./config');

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

        this._bestResult = new BestResult({
            element: document.querySelector('[data-component="best-result"]')
        });

        this._newGame = new NewGame({
            element: document.querySelector('[data-component="new-game"]')
        });

        this._config = new Config({
            element: document.querySelector('[data-component="config"]')
        });

        this._config.setList(Game.getGameTypes());
        this._config.render();

        this._game.on('gameStarted', this._onGameStart.bind(this));
        this._game.on('gameOver', this._onGameOver.bind(this));
        this._newGame.on('newGame', this._onNewGame.bind(this));
        this._config.on('configChanged', this._configChanged.bind(this));
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

        if (status) {
            let seconds = this._timer.getSeconds();

            this._bestResult.updateBestResult(seconds);
            this._bestResult.render();
        }
    }

    _onNewGame(e) {
        this._alert.hide();
        this._timer.clean();
        this._game.restartGame();
    }

    _configChanged(e) {
        let difficulty = e.detail;

        this._game.changeDifficulty(difficulty);
    }
}

module.exports = Page;
