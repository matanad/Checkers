import { Move } from "../logic/classes/move.js";

let draggedPiece = null;
let draggingBoardNum = -1;

export const handleDragEvents = (container, boardNum, game) => {
    const updatePiecePosition = (piece, clientX, clientY) => {
        piece.style.left = `${clientX - 14.5}px`;
        piece.style.top = `${clientY - 14.5}px`;
    };

    const resetPiecePosition = () => {
        if (draggedPiece) {
            draggedPiece.classList.remove('grabbed');
            draggedPiece.style.left = '';
            draggedPiece.style.top = '';
        }
        container.classList.remove('dragging');
        draggedPiece = null;
        draggingBoardNum = -1;
    };

    const onMouseMove = (event) => {
        if (!draggedPiece || draggingBoardNum !== boardNum) return;
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        updatePiecePosition(draggedPiece, clientX, clientY);
    };

    const onMouseDown = (event, boardNum) => {
        const { target } = event;
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        if (draggedPiece || !target.classList.contains('cell')) return;
        const piece = target.querySelector('.piece');
        if (!piece) return;

        draggedPiece = piece;
        draggingBoardNum = boardNum;
        container.classList.add('dragging');
        piece.classList.add('grabbed');
        updatePiecePosition(piece, clientX, clientY);
        event.preventDefault();
    };

    const onMouseUp = (event) => {
        event.stopPropagation();
        if (!draggedPiece || draggingBoardNum !== boardNum) return;
        const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
        const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
        const target = document.elementFromPoint(clientX, clientY)?.closest('.cell');
        if (!target) {
            resetPiecePosition();
            return;
        }

        const from = {
            row: draggedPiece.parentElement.dataset.row,
            col: draggedPiece.parentElement.dataset.col,
        };
        const to = {
            row: target.dataset.row,
            col: target.dataset.col,
        };
        console.log(from, to)
        game.movePiece(new Move(from, to))
        resetPiecePosition();
    };

    return { onMouseMove, onMouseDown, onMouseUp };
};
