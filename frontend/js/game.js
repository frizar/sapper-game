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
        this._updateGameFieldSize();

        this._el.innerHTML = gameFieldTemplate({
            cells: this._cells
        });
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
        this.render(); // render bombs for test (cell was removed from DOM after this!)
        this._openCell(
            this._el.querySelector(`[data-position="${[position[0]]}_${[position[1]]}"]`)
        );
        /* /remove */

        //this._openCell(cell); // production code, uncomment this!

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
        if (cell.classList.contains('open')) {

        }
        let pos = Game._getCellPosition(cell);
        console.log(pos);
        let cellValue = this._cells[pos[0]][pos[1]];
        if (typeof cellValue === 'number') {
            let outerBombs = this._calcOuterBombs(pos);
            console.log(outerBombs, +cell.textContent);
            this._openOuterCells(pos);
        }
    }

    _onRightClick(e, cell) {
        if (this._gameIsOver) {
            return;
        }

        e.preventDefault();

        if (!cell.classList.contains('open')) {
            cell.classList.toggle('bomb');
            cell.classList.toggle('text-danger');
        }
    }

    _openCell(cell) {
        if (cell.classList.contains('bomb')) {
            return;
        }

        let position = Game._getCellPosition(cell);

        let cellValue = this._cells[position[0]][position[1]];
        

        if (cellValue === this._cellTypes.bomb) {
            cell.classList.add('mistake');
            cell.classList.add('bomb');
            this._gameOver();
            return;
        }

        cell.textContent = cellValue;
        cell.classList.add('open');
        if (cellValue === this._cellTypes.empty) {
            this._openOuterCells(position);
        }
    }

    _gameOver() {
        this._gameIsOver = true;
        console.info('Game Over');
    }

    _openOuterCells(pos) {
        this._checkOuterCells(pos[0] - 1, pos[1]);

        this._checkOuterCells(pos[0], pos[1]);

        this._checkOuterCells(pos[0] + 1, pos[1]);
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
            if (this._cells[rowIndex][cellIndex] !== this._cellTypes.bomb) {
                this._openCell(cellElement);
            }
        }
    }

    _calcOuterBombs(pos) {
        let num = 0;

        num += this._calcBombsInOuterCells(pos[0] - 1, pos[1]);

        num += this._calcBombsInOuterCells(pos[0], pos[1]);

        num += this._calcBombsInOuterCells(pos[0] + 1, pos[1]);

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
     * Высота = кол-во строк * размер ячейки + рамка игрового поля.
     * Ширина = кол-во ячеек в строке * размер ячейки + рамка игрового поля.
     * @private
     */
    _updateGameFieldSize() {
        this._el.style.height = this._cells.length * this._field.cellSize
            + this._el.clientLeft + this._el.clientTop + 'px';

        this._el.style.width = this._cells[0].length * this._field.cellSize
            + this._el.clientLeft + this._el.clientTop + 'px';
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
