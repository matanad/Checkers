import { Move } from "./classes/move.js";
import { Piece } from "./classes/piece.js";

export const Game = function (gameEvent) {
    let board;
    let isWhiteTurn;
    let isChainingOn;
    let lastEaterPos;

    this.initGame = () => {
        initBoard();
        isWhiteTurn = true;
        isChainingOn = false;
        lastEaterPos = null;
    }

    const initBoard = () => {
        board = [];
        for (let row = 0; row < 8; row++) {
            board.push([]);
            for (let col = 0; col < 8; col++) {
                let piece;
                if (row < 3 && (row + col) % 2 != 0)
                    piece = new Piece(false);
                else if (row > 4 && (row + col) % 2 != 0)
                    piece = new Piece(true);
                else {
                    piece = new Piece(false, false, true);
                }
                board[row][col] = piece;
            }
        }
    }

    this.getBoard = () => {
        return board;
    }
    const isValidMove = (move, movedPiece) => {
        if (lastEaterPos && (lastEaterPos.row !== move.from.row || lastEaterPos.col !== move.from.col))
            return false;
        if (movedPiece.isWhite !== isWhiteTurn || !movedPiece.isValidMove(board, move, !isChainingOn))
            return false;
        return true;
    }
    this.movePiece = (move) => {
        let isFirstJump = true;
        let isCaptureMove = false;
        const movedPiece = board[move.from.row][move.from.col];
        const targetPiece = board[move.to.row][move.to.col];
        if (!isValidMove(move, movedPiece)) return;
        if (isEatingMove(movedPiece, move, !isChainingOn)) {
            performCapture(movedPiece, move)
            isCaptureMove = true;
        } else {
            removeBurnedPiece();
            if (board[move.from.row][move.from.col].isEmpty) {
                endTurn();
                return;
            }
        }
        executeMove(move, movedPiece, targetPiece);
        if (isFirstJump && (move.to.row === 0 || move.to.row === 7))
            promotePiece(move.to);
        else if (isCaptureMove && movedPiece.isCanEat(board, move.to, false)) {
            isChainingOn = true;
            handleChainCpturing(move, isFirstJump);
            return;
        }
        endTurn();
    }
    const executeMove = (move, movedPiece, targetPiece) => {
        board[move.to.row][move.to.col] = movedPiece;
        board[move.from.row][move.from.col] = new Piece(false, false, true);
        emitPiceMoved(move, movedPiece, targetPiece);
    }
    const endTurn = () => {
        isChainingOn = false;
        lastEaterPos = null;
        if (isGameOver()) return;
        changeTurn();
    }
    const isGameOver = () => {
        if (!isPlayerHavePieces()) {
            gameEvent.emit('gameover', { isWhiteTurn, isWinning: true });
            return true;
        }
        if (isAnyMovesLeft(!isWhiteTurn)) {
            gameEvent.emit('gameover', { isWhiteTurn: true, isWinning: false });
            return true;
        }
    }
    const isPlayerHavePieces = () => {
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board.length; col++) {
                if (!board[row][col].isEmpty && board[row][col].isWhite === !isWhiteTurn)
                    return true;
            }
        }
        return false;
    }
    const handleChainCpturing = (move) => {
        lastEaterPos = move.to;
    }
    const promotePiece = ({ row, col }) => {
        const piece = board[row][col];
        piece.isKing = true;
        gameEvent.emit('piecechanged', { row, col, piece });
    }
    const removeBurnedPiece = () => {
        const possibleCapturePosition = canAnyPieceEat();
        if (possibleCapturePosition) {
            board[possibleCapturePosition.row][possibleCapturePosition.col] = new Piece(false, false, true);
            gameEvent.emit('piece-eaten', possibleCapturePosition);
        }
        return possibleCapturePosition;
    }
    const canAnyPieceEat = () => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (!piece.isEmpty && piece.isWhite === isWhiteTurn && piece.isCanEat(board, { row, col })) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    this.isWhiteTurn = () => {
        return isWhiteTurn;
    }
    const changeTurn = () => {
        isWhiteTurn = !isWhiteTurn;
        gameEvent.emit('turnchanged', { isWhiteTurn });
    }
    const emitPiceMoved = (move, movedPiece, targetPiece) => {
        gameEvent.emit('piece-moved', {
            from: move.from,
            to: move.to,
            movedPiece,
            targetPiece,
        });
    }
    const handlePawnJump = (move) => {
        const direction = move.getDirection();
        const row = Math.floor(move.getFrom().row + direction.row / 2)
        const col = Math.floor(move.getFrom().col + direction.col / 2);
        board[row][col] = new Piece(false, false, true);
        gameEvent.emit('piece-eaten', { row, col });
    }
    const handleKingJump = (move) => {
        {
            let { row: rowStep, col: colStep } = move.getStepDirection();
            let row = move.from.row + rowStep;
            let col = move.from.col + colStep;
            while (row != move.to.row || col != move.to.col) {
                if (!board[row][col].isEmpty) {
                    board[row][col] = new Piece(false, false, true);
                    gameEvent.emit('piece-eaten', { row, col });
                    return;
                };
                row += rowStep;
                col += colStep;
            }
            return;
        }
    }
    const performCapture = (selectedPiece, move) => {
        selectedPiece.isKing ? handleKingJump(move) : handlePawnJump(move);
    }
    const isEatingMove = (selectedPiece, move, isFirstJump) => {
        return selectedPiece.isValidPawnJump(board, move, isFirstJump) ||
            selectedPiece.isKingEatingMove(board, move);
    }

    const isAnyMovesLeft = (isWhite = isWhiteTurn) => {
        for (let row = 0; row < 8; row++)
            for (let col = 0; col < 8; col++) {
                const currPiece = board[row][col];
                if (currPiece.isEmpty || currPiece.isWhite !== isWhite) continue;
                for (let toRow = 0; toRow < 8; toRow++)
                    for (let toCol = 0; toCol < 8; toCol++) {
                        const move = new Move({ row, col }, { row: toRow, col, toCol })
                        if (currPiece.isValidMove(board, move))
                            return true;
                    }
            }
        return false;
    }

    this.initGame();
}
