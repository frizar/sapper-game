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

        let gameTypes = Game.getGameTypes();

        this._config.setList(gameTypes);
        this._config.render();

        this._bestResult.setDefaultValues(gameTypes);
        this._bestResult.render();

        this._game.on('gameStarted', this._onGameStart.bind(this));
        this._game.on('gameOver', this._onGameOver.bind(this));
        this._newGame.on('newGame', this._onNewGame.bind(this));
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
            let difficulty = this._game.getDifficulty();

            this._bestResult.updateBestResult(difficulty, seconds);
            this._bestResult.render();
        }
    }

    _onNewGame(e) {
        this._alert.hide();
        this._timer.clean();

        let difficulty = this._config.getValue();
        this._game.changeDifficulty(difficulty);

        this._game.restartGame();
    }
}

module.exports = Page;
