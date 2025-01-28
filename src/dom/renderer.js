import { handleDragEvents } from "./dnd.js";
import { Modal } from "./modal.js";

let boardsCount = 0;

export const Renderer = function (elContainer, gameInstance, gameEvent) {
    const container = elContainer;
    const game = gameInstance;
    let boardNum = ++boardsCount;
    const { onMouseMove, onMouseDown, onMouseUp } = handleDragEvents(container, boardNum, game);

    this.createGame = () => {
        const elBoardContainer = createBoardContainer();
        const elBoard = elBoardContainer.querySelector('.board');
        const board = game.getBoard();
        createBoard(board, elBoard);
        container.appendChild(elBoardContainer);
        document.body.addEventListener('mouseup', onMouseUp);
        document.body.addEventListener('touchend', onMouseUp);
        createControllers(container);
    };
    const createBoard = (board, elBoard) => {
        for (let row = 0; row < 8; row++)
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                const elCell = createCell(row, col, piece)
                elBoard.appendChild(elCell);
            }
    }
    const createPiece = (piece) => {
        const elPiece = document.createElement('div');
        elPiece.classList.add('piece', piece.isWhite ? 'white' : 'black');
        elPiece.classList.toggle('king', piece.isKing);
        return elPiece;
    }

    const createCell = (row, col, piece) => {
        const elCell = document.createElement('button');
        elCell.classList.add('cell', (row + col) % 2 === 0 ? 'white' : 'black');
        elCell.classList.toggle('cursor-auto', game.isWhiteTurn() !== piece.isWhite);
        elCell.dataset.row = row;
        elCell.dataset.col = col;

        if (!piece.isEmpty)
            elCell.appendChild(createPiece(piece));

        addCellEvents(elCell, game, container);
        return elCell;
    };

    const addCellEvents = (elCell) => {
        elCell.addEventListener('mousedown', (e) => onMouseDown(e, boardNum));
        elCell.addEventListener('touchstart', (e) => onMouseDown(e, boardNum));
        elCell.addEventListener('mousemove', onMouseMove);
        elCell.addEventListener('touchmove', onMouseMove);
    };
    const setControllersEvents = () => {
        const elResignBtn = container.querySelector('.resign-btn');
        const elDrawBtn = container.querySelector('.draw-btn');
        elResignBtn.addEventListener('click', () => gameEvent.emit('resign', {}));
        elDrawBtn.addEventListener('click', () => gameEvent.emit('draw', {}));
    }
    const startNewGame = () => {
        game.initGame();
        const elBoard = container.querySelector('.board');
        container.querySelector('.turn').innerText = 'White turn';
        container.querySelector('.turn').classList.remove('opacity', 'black')
        elBoard.innerHTML = '';
        createBoard(game.getBoard(), elBoard);
        showControllers();
        setControllersEvents();
    }
    const showControllers = () => {
        const elControlBtnContainer = container.querySelector('.controllers.btn-container');
        elControlBtnContainer.classList.remove('opacity');
    }
    const hideControllers = () => {
        const elControlBtnContainer = container.querySelector('.controllers.btn-container');
        elControlBtnContainer.classList.add('opacity');
    }
    const createBoardContainer = () => {
        const modal = new Modal(game, gameEvent, startNewGame);
        const elBoardContainer = document.createElement('div');
        const elBoard = document.createElement('div');
        elBoardContainer.classList.add('board-container');
        elBoard.classList.add('board');
        elBoardContainer.innerHTML = `<div class="board-texture"></div>`;
        elBoardContainer.appendChild(modal);
        elBoardContainer.appendChild(elBoard);
        return elBoardContainer;
    };
    const createControllers = (container) => {
        const elControllers = document.createElement('div');
        elControllers.classList.add('btn-container', 'controllers', 'opacity');
        elControllers.innerHTML = `
            <button class="resign-btn">Resign</button>
            <button class="draw-btn">Draw</button>
        `;
        container.appendChild(elControllers);
    };
    this.renderGame = () => {
        container.innerHTML = `
            <h2 class="game-header">Game ${boardNum}</h2>
            <h1 class="turn opacity">White turn</h1>
        `;
        this.createGame();
    };
    gameEvent.on('turnchanged', ({ isWhiteTurn }) => {
        container.querySelector('.turn').classList.remove('opacity');
        container.querySelector('.turn').classList.toggle('black', !isWhiteTurn);
        container.querySelector('.turn').textContent = isWhiteTurn ? 'White turn' : 'Black turn';
        toggleClickablePieces();
    });
    gameEvent.on('piece-moved', ({ from, to }) => {
        const fromCell = container.querySelector(`[data-row="${from.row}"][data-col="${from.col}"]`);
        const toCell = container.querySelector(`[data-row="${to.row}"][data-col="${to.col}"]`);
        const pieceElement = fromCell.querySelector('.piece');
        fromCell.innerHTML = '';
        toCell.innerHTML = '';
        toCell.appendChild(pieceElement);
        toggleClickablePieces();
    });
    gameEvent.on('piece-eaten', ({ row, col }) => {
        const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.innerHTML = '';
    });
    gameEvent.on('piecechanged', ({ row, col, piece }) => {
        const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.innerHTML = '';
        cell.appendChild(createPiece(piece));
    });
    const toggleClickablePieces = () => {
        container.querySelectorAll('.cell').forEach(elCell => {
            const piece = elCell.querySelector('.piece');
            if (piece) {
                elCell.classList.toggle('cursor-auto', game.isWhiteTurn() !== piece.classList.contains('white'));
            }
        });
    }
    gameEvent.on('resign', () => {
        hideControllers();
    })
    gameEvent.on('draw', () => {
        hideControllers();
    })
    gameEvent.on('modal-closed', () => {
        showControllers();
    })
    gameEvent.on('modal-opened', () => {
        hideControllers();
    })
};
