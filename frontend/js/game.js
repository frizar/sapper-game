'use strict';

const BaseComponent = require('./baseComponent');
const Numbers = require('./numbers');
const gameFieldTemplate = require('../templates/game.hbs');

class Game extends BaseComponent {
    constructor(options) {
        super(options.element);

        this._gameIsOver = false;

        this._gameType = 'easy';

        this._gameTypes = {
            easy: [9, 9, 10],
            normal: [16, 16, 40],
            hard: [30, 16, 99],
        };

        this._cells = [];

        this._cellTypes = {
            empty: '',
            bomb: 'X'
        };

        this._initField();
        this._resetCells();
        this.render();

        this._onNewGame = this._onNewGame.bind(this);
        this._el.addEventListener('click', this._onNewGame);
        this.on('contextmenu', this._onRightClick.bind(this), '.game-field__cell');
    }

    /**
     * Отображает поле для игры и устанавливает его размер
     */
    render() {
        this._el.innerHTML = gameFieldTemplate({
            cells: this._cells
        });

        this._updateGameFieldSize();
    }

    restartGame() {
        this._gameIsOver = true;

        this._initField();
        this._resetCells();
        this.render();

        this._el.addEventListener('click', this._onNewGame);
    }

    changeDifficulty(difficulty) {
        this._gameType = difficulty;
    }

    _initField() {
        this._field = {
            width: this._gameTypes[this._gameType][0],
            height: this._gameTypes[this._gameType][1],
            bombsCount: this._gameTypes[this._gameType][2],
            bombsPlanted: 0,
            cellSize: 30
        };
    }

    /**
     * Обработчик первого клика, инициирует начало игры
     * @param e
     * @private
     */
    _onNewGame(e) {
        let cell = e.target.closest('.game-field__cell');
        if (!cell || !this._el.contains(cell)) {
            return;
        }

        this._gameIsOver = false;

        // удаляем этот обработчик
        this._el.removeEventListener('click', this._onNewGame);

        let position = Game._getCellPosition(cell);

        // устанавливаем мины после первого клика, чтобы нельзя было проиграть сразу же
        this._setBombs(position);
        // устанавливаем в массив ячеек числа (сколько вокруг каждой ячейки мин)
        this._setNumbers();
        // открываем первую кликнутую ячейку
        this._openCell(cell);

        this.on('click', this._onClick.bind(this), '.game-field__cell');
        // сообщаем странице, что игра началась
        this.trigger('gameStarted');
    }

    /**
     * Метод завершает игру
     * @param status - false - проигрыш, true - выигрыш
     * @private
     */
    _gameOver(status) {
        this._gameIsOver = true;

        // сообщаем странице, что игра завершилась
        this.trigger('gameOver', status);
    }

    /**
     * Обработчик клика по ячейкам
     * @param e
     * @param cell
     * @private
     */
    _onClick(e, cell) {
        if (this._gameIsOver) {
            return;
        }

        // при клике левой кнопкой
        if (e.which === 1) {
            // открываем ячейку
            this._openCell(cell);
            // а правой
        } else if (e.which === 2) {
            // открываем смежные
            this._showOuterCells(cell);
        }
    }

    /**
     * Открывает ячейки вокруг заданной (клик средней кнопкой) по правилам игры
     * @param cell
     * @private
     */
    _showOuterCells(cell) {
        let position = Game._getCellPosition(cell);
        let cellValue = this._cells[position[0]][position[1]];
        if (cell.classList.contains('open') && !cell.classList.contains('bomb') && typeof cellValue === 'number') {
            let markedBombs = this._calcOuterMarkers(position);
            // открываем в том случае, если кол-во отметок вокруг ячейки соответствует ее числу
            // здесь игрок может ошибиться и проиграть
            if (+cell.textContent === markedBombs) {
                this._openOuterCells(position);
            }
        }
    }

    /**
     * Считает кол-во меток вокруг заданной ячейки
     * @param position
     * @returns {number}
     * @private
     */
    _calcOuterMarkers(position) {
        let num = 0;

        num += this._calcMarkedCells(position[0] - 1, position[1]);

        num += this._calcMarkedCells(position[0], position[1]);

        num += this._calcMarkedCells(position[0] + 1, position[1]);

        return num;
    }

    /**
     * Проверяет окружающие ячейки на наличие маркера построчно (3 сверху, 3 снизу и 3 в той же строке)
     * @param rowIndex
     * @param cellIndex
     * @returns {number}
     * @private
     */
    _calcMarkedCells(rowIndex, cellIndex) {
        let num = 0;

        if (this._cells[rowIndex]) {
            num += this._markerInCell(rowIndex, cellIndex - 1);

            num += this._markerInCell(rowIndex, cellIndex);

            num += this._markerInCell(rowIndex, cellIndex + 1);
        }

        return num;
    }

    /**
     * Метод говорит есть ли на ячейке метка
     * @param rowIndex
     * @param cellIndex
     * @returns {boolean}
     * @private
     */
    _markerInCell(rowIndex, cellIndex) {
        let cellElement = this._el.querySelector(`[data-position="${rowIndex}_${cellIndex}"]`);

        return cellElement ?
            cellElement.classList.contains('bomb') :
            false;
    }

    /**
     * Ставит/снимает на/с ячейку метку мины по правому клику
     * @param e
     * @param cell
     * @private
     */
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

    /**
     * Метод открывает ячейку
     * Если она оказывается пустой, то рекурсивно открывает смежные ячейки без мин
     * @param cell
     * @private
     */
    _openCell(cell) {
        if (cell.classList.contains('bomb')) {
            return;
        }

        let position = Game._getCellPosition(cell);

        let cellValue = this._cells[position[0]][position[1]];

        // если была открыта мина, то завершаем игру с проигрышем
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

    /**
     * Проверка условия выигрыша по правилам игры
     * Игра считается выиграной, если открыты все ячейки, свободные от мин
     * @private
     */
    _checkVictoryCondition() {
        // количество открытых ячеек
        let openedCells = this._el.querySelectorAll('.game-field__cell.open').length;
        // количество ячеек, свободных от мин
        let cleanCells = this._field.width * this._field.height - this._field.bombsCount;
        if (openedCells === cleanCells) {
            this._gameOver(true);

            this._showAllBombs();
        }
    }

    /**
     * Метод открывает все мины на карте
     * @private
     */
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

    /**
     * Метод делает проверку окружающих ячеек и открывает их, если это возможно и соответствует правилам игры
     * @param position
     * @private
     */
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

    /**
     * Метод считает кол-во мин в массиве вокруг указанной ячейки
     * @param position
     * @returns {number}
     * @private
     */
    _calcOuterBombs(position) {
        let num = 0;

        num += this._calcBombsInOuterCells(position[0] - 1, position[1]);

        num += this._calcBombsInOuterCells(position[0], position[1]);

        num += this._calcBombsInOuterCells(position[0] + 1, position[1]);

        return num;
    }

    /**
     * Метод возвращает кол-во мин в заданной строке относительно указанных "координат" кликнутой ячейки
     * (3 ячейки сверху, 3 в той же строке, включая саму ячейку и 3 снизу)
     * @param rowIndex
     * @param cellIndex
     * @returns {number}
     * @private
     */
    _calcBombsInOuterCells(rowIndex, cellIndex) {
        let num = 0;

        if (this._cells[rowIndex]) {
            num += +this._bombInCell(rowIndex, cellIndex - 1);

            num += +this._bombInCell(rowIndex, cellIndex);

            num += +this._bombInCell(rowIndex, cellIndex + 1);
        }

        return num;
    }

    /**
     * Метод возвращает значение для ячейки в массиве (мина или нет)
     * @param rowIndex
     * @param cellIndex
     * @returns {boolean}
     * @private
     */
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
            // выбираем случайную ячейку
            let randomRow = Numbers.getRandomInteger(0, this._field.height - 1);
            let randomCell = Numbers.getRandomInteger(0, this._field.width - 1);

            // она не должна быть той, с которой началась игра
            if (excludedCell[0] === randomRow && excludedCell[1] === randomCell) {
                continue;
            }

            // ставим отметку в массиве, что это мина
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
            this._cells[i] = []; // создаем двумерный массив

            for (let j = 0; j < this._field.width; j++) {
                // и заполняем его пустыми строками
                this._cells[i][j] = this._cellTypes.empty;
            }
        }
    }

    /**
     * Метод принимает элемент ячейки и возвращает ее "координаты" из data-атрибута
     * @param cell
     * @returns {*[]}
     * @private
     */
    static _getCellPosition(cell) {
        let cellPos = cell.dataset.position.split('_');
        return [+cellPos[0], +cellPos[1]];
    }

    /**
     * Добавляет ячейке метку с миной
     * @param cell
     * @private
     */
    static _addBombToCell(cell) {
        cell.classList.add('bomb');
        cell.classList.remove('text-danger');
        cell.innerHTML = '<i class="fa fa-bomb" aria-hidden="true"></i>';
    }

    /**
     * Снимает с ячейки метку с миной
     * @param cell
     * @private
     */
    static _removeBombFromCell(cell) {
        cell.classList.remove('bomb');
        cell.classList.add('text-danger');
        cell.innerHTML = '';
    }

    static getGameTypes() {
        return {
            'easy': 'Easy: 9x9, 10 mines',
            'normal': 'Normal: 16x16, 40 mines',
            'hard': 'Hard: 30x16, 99 mines'
        };
    }
}

module.exports = Game;
