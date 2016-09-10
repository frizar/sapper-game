'use strict';

const BaseComponent = require('./baseComponent');
const Numbers = require('./numbers');
const gameFieldTemplate = require('../templates/game.hbs');

class Game extends BaseComponent {
    constructor(options) {
        super(options.element);

        this._gameIsOver = false;

        this._cells = [];

        this._field = {
            width: 9,
            height: 9,
            bombsCount: 10,
            bombsPlanted: 0,
            cellSize: 30
        };

        this._cellTypes = {
            empty: '',
            bomb: 'X'
        };

        this._resetCells();
        this.render();

        this._onNewGame = this._onNewGame.bind(this);
        this._el.addEventListener('click', this._onNewGame);
        this.on('contextmenu', this._onRightClick.bind(this), '.game-field__cell');
    }

    render() {
        this._el.innerHTML = gameFieldTemplate({
            cells: this._cells
        });

        this._updateGameFieldSize();
    }

    static _getCellPosition(cell) {
        let cellPos = cell.dataset.position.split('_');
        return [+cellPos[0], +cellPos[1]];
    }

    _onNewGame(e) {
        let cell = e.target.closest('.game-field__cell');
        if (!cell || !this._el.contains(cell)) {
            return;
        }

        this._el.removeEventListener('click', this._onNewGame);

        let position = Game._getCellPosition(cell);

        this._setBombs(position);
        this._setNumbers();

        /* #remove code below ! */
        /*this.render(); // render bombs for test (cell was removed from DOM after this!)
        this._openCell(
            this._el.querySelector(`[data-position="${[position[0]]}_${[position[1]]}"]`)
        );
        /* /remove */

        this._openCell(cell); // production code, uncomment this!

        this.on('click', this._onClick.bind(this), '.game-field__cell');
        this.trigger('gameStarted');
    }

    _onClick(e, cell) {
        if (this._gameIsOver) {
            return;
        }

        if (e.which === 1) {
            this._openCell(cell);
        } else if (e.which === 2) {
            this._showOuterCells(cell);
        }
    }

    _showOuterCells(cell) {
        let position = Game._getCellPosition(cell);
        let cellValue = this._cells[position[0]][position[1]];
        if (cell.classList.contains('open') && !cell.classList.contains('bomb') && typeof cellValue === 'number') {
            let markedBombs = this._calcOuterMarkers(position);
            if (+cell.textContent === markedBombs) {
                this._openOuterCells(position);
            }
        }
    }

    _calcOuterMarkers(position) {
        let num = 0;

        num += this._calcMarkedCells(position[0] - 1, position[1]);

        num += this._calcMarkedCells(position[0], position[1]);

        num += this._calcMarkedCells(position[0] + 1, position[1]);

        return num;
    }

    _calcMarkedCells(rowIndex, cellIndex) {
        let num = 0;

        if (this._cells[rowIndex]) {
            num += this._markerInCell(rowIndex, cellIndex - 1);

            num += this._markerInCell(rowIndex, cellIndex);

            num += this._markerInCell(rowIndex, cellIndex + 1);
        }

        return num;
    }

    _markerInCell(rowIndex, cellIndex) {
        let cellElement = this._el.querySelector(`[data-position="${rowIndex}_${cellIndex}"]`);

        return cellElement ?
            cellElement.classList.contains('bomb') :
            false;
    }

    _onRightClick(e, cell) {
        if (this._gameIsOver) {
            return;
        }

        e.preventDefault();

        if (!cell.classList.contains('open')) {
            if (!cell.classList.contains('bomb')) {
                Game._addBombToCell(cell);
            } else {
                Game._removeBombFromCell(cell);
            }
        }
    }

    static _addBombToCell(cell) {
        cell.classList.add('bomb');
        cell.classList.remove('text-danger');
        cell.innerHTML = '<i class="fa fa-bomb" aria-hidden="true"></i>';
    }

    static _removeBombFromCell(cell) {
        cell.classList.remove('bomb');
        cell.classList.add('text-danger');
        cell.innerHTML = '';
    }

    _openCell(cell) {
        if (cell.classList.contains('bomb')) {
            return;
        }

        let position = Game._getCellPosition(cell);

        let cellValue = this._cells[position[0]][position[1]];

        if (cellValue === this._cellTypes.bomb) {
            this._gameOver(false);

            this._showAllBombs();

            cell.classList.add('mistake');
            cell.classList.add('text-danger');

            return;
        }

        cell.textContent = cellValue;
        cell.classList.add('open');

        let victory = this._checkVictoryCondition();
        if (victory) {
            this._gameIsOver(true);
        }

        if (cellValue === this._cellTypes.empty) {
            this._openOuterCells(position);
        }
    }

    _checkVictoryCondition() {
        let openedCells = this._el.querySelectorAll('.game-field__cell.open').length;
        let cleanCells = this._field.width * this._field.height - this._field.bombsCount;
        if (openedCells === cleanCells) {
            this._gameOver(true);

            this._showAllBombs();
        }
    }

    _showAllBombs() {
        for (let i = 0; i < this._field.height; i++) {
            for (let j = 0; j < this._field.width; j++) {
                if (this._cells[i][j] === this._cellTypes.bomb) {
                    let cellElement = this._el.querySelector(`[data-position="${i}_${j}"]`);
                    Game._addBombToCell(cellElement);
                }
            }
        }
    }

    _gameOver(status) {
        this._gameIsOver = true;
        let result = `Game Over. You ${(status ? 'won' : 'lose')}!`;
        console.info(result);
        alert(result);
    }

    _openOuterCells(position) {
        this._checkOuterCells(position[0] - 1, position[1]);

        this._checkOuterCells(position[0], position[1]);

        this._checkOuterCells(position[0] + 1, position[1]);
    }

    _checkOuterCells(rowIndex, cellIndex) {
        if (this._cells[rowIndex]) {
            this._checkCell(rowIndex, cellIndex - 1);

            this._checkCell(rowIndex, cellIndex);

            this._checkCell(rowIndex, cellIndex + 1);
        }
    }

    _checkCell(rowIndex, cellIndex) {
        let cellElement = this._el.querySelector(`[data-position="${rowIndex}_${cellIndex}"]`);
        if (cellElement && !cellElement.classList.contains('open')) {
            this._openCell(cellElement);
        }
    }

    _calcOuterBombs(position) {
        let num = 0;

        num += this._calcBombsInOuterCells(position[0] - 1, position[1]);

        num += this._calcBombsInOuterCells(position[0], position[1]);

        num += this._calcBombsInOuterCells(position[0] + 1, position[1]);

        return num;
    }

    _calcBombsInOuterCells(rowIndex, cellIndex) {
        let num = 0;

        if (this._cells[rowIndex]) {
            num += +this._bombInCell(rowIndex, cellIndex - 1);

            num += +this._bombInCell(rowIndex, cellIndex);

            num += +this._bombInCell(rowIndex, cellIndex + 1);
        }

        return num;
    }

    _bombInCell(rowIndex, cellIndex) {
        return this._cells[rowIndex][cellIndex] === this._cellTypes.bomb;
    }

    /**
     * Устанавливает мины на поле
     * @param excludedCell - исключенная ячейка
     * (нужна при старте игры, чтобы нельзя было проиграть с первого же клика)
     * @private
     */
    _setBombs(excludedCell) {
        this._field.bombsPlanted = 0;

        while (this._field.bombsPlanted < this._field.bombsCount) {
            let randomRow = Numbers.getRandomInteger(0, this._field.height - 1);
            let randomCell = Numbers.getRandomInteger(0, this._field.width - 1);

            if (excludedCell[0] === randomRow && excludedCell[1] === randomCell) {
                continue;
            }

            if (this._cells[randomRow][randomCell] === this._cellTypes.empty) {
                this._cells[randomRow][randomCell] = this._cellTypes.bomb;
                this._field.bombsPlanted++;
            }
        }
    }

    /**
     * Считает количество мин вокруг каждой свободной ячейки и
     * устанавливает эти значения в массив поля (0 игнорируется)
     * @private
     */
    _setNumbers() {
        for (let i = 0; i < this._field.height; i++) {
            for (let j = 0; j < this._field.width; j++) {
                if (this._cells[i][j] === this._cellTypes.empty) {
                    let outerBombs = this._calcOuterBombs([i, j]);
                    if (outerBombs) {
                        this._cells[i][j] = outerBombs;
                    }
                }
            }
        }
    }

    /**
     * Устанавливает размер игрового поля.
     * @private
     */
    _updateGameFieldSize() {
        // высота = кол-во строк * размер ячейки + рамка игрового поля
        this._el.style.height = this._cells.length * this._field.cellSize + 20 + 'px';
        // высота = кол-во строк * размер ячейки + рамка игрового поля
        this._el.style.width = this._cells[0].length * this._field.cellSize + 20 + 'px';
    }

    /**
     * Создает массив строк и ячеек в них (по размеру поля), заполняя их пустыми строками.
     * Пустая строка === свободная ячейка, вокруг которой нет мин.
     * @private
     */
    _resetCells() {
        this._cells = [];

        for (let i = 0; i < this._field.height; i++) {
            this._cells[i] = [];

            for (let j = 0; j < this._field.width; j++) {
                this._cells[i][j] = this._cellTypes.empty;
            }
        }
    }
}

module.exports = Game;
