class Game {
  constructor(width, height, count) {
    this.cellsCnt = 100;
    this.width = width || 20;
    this.height = height || 20;
    this.count = count || 10000;
    this.gridDom = document.querySelector('.grid');
    this.loader = document.querySelector('.loader');
    this.activeCells = [];
    this.cells = [];
    this.countOfRandomCells = 500;
    /**/
    window.canDoActiveCells = true;
    /*инпут ширины экрана*/
    document.querySelector(".set-screen-size").addEventListener("change", (event) => {
      this.cellsCnt = event.target.value
      document.querySelector('.content').style.width = `${event.target.value * this.width}px`
      this.startGrid()
    })
  }

  /*обновляем ячейки*/
  _updateActiveCells = () => {
    this.activeCells.forEach((el) => {
      this.cells[el.id].isActive = true
      el.link.className = el.link.className + ' active'
    })
  }
  /*функция клика по ячейке*/
  _onClickFunction = (i, newDiv) => {
    if (!window.canDoActiveCells) {
      return
    }
    this.activeCells.push({id: i, link: newDiv})
    this._updateActiveCells()
  }
  /*получение соседних ячеек*/
  _getNeigbords = (id) => {
    const firstRowCell = id - parseInt(id / this.rowCellsCnt, 10) * this.rowCellsCnt
    const lastRowCell = parseInt((this.cells.length - id) / this.rowCellsCnt, 10) * this.rowCellsCnt + id
    const leftBottomCell = this.rowCellsCnt * (this.rowsCount - 1) + 1
    return [
      this.cells[id - 1] || this.cells[this.cells.length - 1],
      this.cells[id + 1] || this.cells[0],
      this.cells[id - this.rowCellsCnt] || this.cells[lastRowCell] || this.cells[this.cells.length - 1],
      this.cells[id + this.rowCellsCnt] || this.cells[firstRowCell],
      this.cells[id - this.rowCellsCnt - 1] || this.cells[lastRowCell - 1] || this.cells[this.cells.length - 1],
      this.cells[id - this.rowCellsCnt + 1] || this.cells[lastRowCell + 1] || this.cells[leftBottomCell],
      this.cells[id + this.rowCellsCnt + 1] || this.cells[firstRowCell + 1] || this.cells[0],
      this.cells[id + this.rowCellsCnt - 1] || this.cells[firstRowCell - 1] || this.cells[this.rowCellsCnt - 1],
    ]
  }

  /*создание грида*/
  startGrid = () => {
    this.gridDom.innerHTML = ''
    this.cells = []
    this.activeCells = []
    for (let i = 0; i < this.cellsCnt * this.cellsCnt; i++) {
      const newDiv = document.createElement("div");
      newDiv.id = i;
      newDiv.className = 'cell';
      newDiv.style.width = `${this.width}px`
      newDiv.style.height = `${this.height}px`
      newDiv.onclick = this._onClickFunction.bind(this, i, newDiv)
      this.cells.push({id: i, link: newDiv})
      this.gridDom.appendChild(newDiv)
    }
    this.rowCellsCnt = parseInt((document.querySelector('.grid').offsetWidth) / (this.width))
    this.cells.forEach((el, i) => {
      const positionInRow = i - parseInt(i / this.rowCellsCnt, 10) * this.rowCellsCnt
      this.cells[i].positionInRow = positionInRow
      this.cells[i].row = parseInt(i / this.rowCellsCnt, 10)
    })
    this.rowsCount = this.cells[this.cells.length - 1].row
  }

  setClickMode = () => {
    window.canDoActiveCells = true
  }

  /*создание рандомных клеток*/
  setRandom = () => {
    setTimeout(() => {
      /**/
      this.activeCells = []
      this._updateActiveCells();
      /**/
      const nums = this.cells.map(el => el.id)
      let i = nums.length;
      let j = 0;
      let randomNumbers = []

      while (randomNumbers.length < this.countOfRandomCells) {
        j = Math.floor(Math.random() * (i+1));
        randomNumbers.push(nums[j]);
        nums.splice(j,1);
        randomNumbers = randomNumbers.filter(el => el)
      }

      // todo - не баг а фича, из this.cells не удаляются isActive
      this.activeCells = randomNumbers.map((random) => this.cells.find(el => el.id === random))
      this._updateActiveCells();
    }, 10)
  }

  setBigScreen = () => {
    const contentDom = document.querySelector('.content')
    if (contentDom.classList.contains('content-very-big')) {
      contentDom.classList.remove('content-very-big')
    } else {
      contentDom.className = contentDom.className + ' content-very-big'
    }
  }

  /*цикл жизни*/
  startByIteration = () => {
    let willBornCells = [];
    let willBornCellsHash = {};
    const date = Date.now();
    const aliveActiveCells = [];
    const willDieCells = [];
    const willDieCellsHash = {};
    /*во всех соседях активных ячейках ищутся не активные*/
    this.activeCells.forEach((activeCell) => {
      if (willDieCellsHash[activeCell.id]) {
        return
      }
      const neighbords = this._getNeigbords(activeCell.id).filter(activeCell => !activeCell.isActive)
      /* чекаем не активную ячейку на возможность создания ячейки */
      neighbords.forEach((cell) => {
        if (willBornCellsHash[cell.id]) {
          return
        }
        /**/
        const activeCellsNear = this._getNeigbords(cell.id).filter(activeCell => activeCell.isActive)
        if (activeCellsNear.length > 2 && activeCellsNear.length < 4) {
          willBornCells.push(cell)
          willBornCellsHash[cell.id] = true
        }
      })
      if (neighbords.length !== 6 && neighbords.length !== 5) {
        willDieCells.push(activeCell)
        willDieCellsHash[activeCell.id] = true
      } else {
        aliveActiveCells.push(activeCell)
      }
    })
    /*удаляем, добавляем ячейки*/
    willDieCells.forEach(el => {
      this.cells[el.id].isActive = false;
      el.link.classList.remove("active")
    })
    this.activeCells = [...aliveActiveCells, ...willBornCells];
    this._updateActiveCells()
    document.querySelector('.time').innerHTML = `${Date.now() - date} ms`
  }

  interval;

  /*старт цикла жизни*/
  startLive = () => {
    this.interval = setInterval( this.startByIteration, 50)
  }
  stopLive = () => {
    clearInterval(this.interval)
  }
}


window.onload = function() {
  const game = new Game();
  window.game = game;
  game.startGrid()
};
