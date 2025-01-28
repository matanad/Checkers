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
        updatePiecePosition(draggedPiece, event.clientX, event.clientY);
    };

    const onMouseDown = ({ target, clientX, clientY }, boardNum) => {
        if (draggedPiece || !target.classList.contains('cell')) return;
        const piece = target.querySelector('.piece');
        if (!piece) return;

        draggedPiece = piece;
        draggingBoardNum = boardNum;
        container.classList.add('dragging');
        piece.classList.add('grabbed');
        updatePiecePosition(piece, clientX, clientY);
    };

    const onMouseUp = (event) => {
        event.stopPropagation();
        if (!draggedPiece || draggingBoardNum !== boardNum) return;

        const target = event.target.closest('.cell');
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

        game.movePiece(new Move(from, to))
        resetPiecePosition();
    };

    return { onMouseMove, onMouseDown, onMouseUp };
};
