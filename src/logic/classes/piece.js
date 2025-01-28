import { Move } from "./move.js";

export const Piece = function (isWhite = false, isKing = false, isEmpty = false) {
    this.isWhite = isWhite;
    this.isKing = isKing;
    this.isEmpty = isEmpty;

    this.getIsWhite = () => this.isWhite;
    this.setIsWhite = (isWhite) => { this.isWhite = isWhite; };
    this.getIsKing = () => this.isKing;
    this.promote = () => { this.isKing = true; };

    this.isValidMove = (board, move, isFirstJump = true) => {
        if (this.isEmpty || !board[move.getTo().row][move.getTo().col].isEmpty) return false;
        return this.isKing ?
            this.isValidKingMove(board, move, isFirstJump) :
            this.isValidPawnMove(board, move, isFirstJump);
    };

    this.isValidKingMove = (board, move, isFirstJump = true) => {
        if (!move.isDiagonal() || move.getRowsDiff() !== move.getColsDiff()) return false;
        return this.isKingEatingMove(board, move, isFirstJump) || (isFirstJump && this.isClearPath(board, move));
    };

    this.isKingEatingMove = (board, move) => {
        if (!this.isKing || !move.isDiagonal() || move.getRowsDiff() < 2 || !board[move.to.row][move.to.col].isEmpty) return false;
        return this.hasSingleOpponentInPath(board, move);
    };

    this.isValidPawnMove = (board, move, isFirstJump = true) => {
        if (!move.isDiagonal()) return false;
        const direction = move.getDirection();
        const rowsDiff = move.getRowsDiff();
        const colsDiff = move.getColsDiff();

        if ((rowsDiff === 2 || colsDiff === 2) && this.isValidPawnJump(board, move, isFirstJump)) return true;
        if (!isFirstJump || rowsDiff !== 1 || colsDiff !== 1 || !board[move.to.row][move.to.col].isEmpty) return false;

        return (direction.row === -1 && this.isWhite) || (direction.row === 1 && !this.isWhite);
    };

    this.isValidPawnJump = (board, move, isFirstJump = true) => {
        if (!move.isDiagonal() || move.getRowsDiff() !== 2 || move.getColsDiff() !== 2) return false;

        const direction = move.getStepDirection();
        const middleRow = move.from.row + direction.row;
        const middleCol = move.from.col + direction.col;
        const middleCell = board[middleRow][middleCol];

        if (!board[move.to.row][move.to.col].isEmpty || middleCell.isEmpty || middleCell.isWhite === this.isWhite) return false;
        return isFirstJump ? direction.row === (this.isWhite ? -1 : 1) : true;
    };

    this.isCanEat = (board, pos, isFirstJump = true) => {
        return this.isKing ?
            this.isKingCanEat(board, pos) :
            this.isPawnCanEat(board, pos, isFirstJump);
    };

    this.isPawnCanEat = (board, pos, isFirstJump = true) => {
        for (let row = -1; row <= 1; row += 2) {
            for (let col = -1; col <= 1; col += 2) {
                const to = { row: pos.row + row * 2, col: pos.col + col * 2 };
                if (to.row < 0 || to.row >= 8 || to.col < 0 || to.col >= 8) continue;
                const move = new Move(pos, to);
                if (this.isValidPawnJump(board, move, isFirstJump)) return true;
            }
        }
        return false;
    };

    this.isKingCanEat = (board, pos) => {
        const directions = [
            { row: -1, col: -1 }, { row: -1, col: 1 },
            { row: 1, col: -1 }, { row: 1, col: 1 },
        ];
        for (const direction of directions) {
            let row = pos.row + direction.row * 2;
            let col = pos.col + direction.col * 2;
            while (row >= 0 && row < 8 && col >= 0 && col < 8) {
                const move = new Move(pos, { row, col });
                if (this.isKingEatingMove(board, move)) return true;
                row += direction.row;
                col += direction.col;
            }
        }
        return false;
    };

    this.isClearPath = (board, move) => {
        const direction = move.getStepDirection();
        let { row, col } = move.from;
        const { row: toRow, col: toCol } = move.to;
        let piecesInWay = 0;

        while (row !== toRow && col !== toCol) {
            row += direction.row;
            col += direction.col;

            const piece = board[row][col];
            if (!piece.isEmpty)
                if (piece.isWhite === this.isWhite || ++piecesInWay > 1) return false;
        }
        return true;
    };

    this.hasSingleOpponentInPath = (board, move) => {
        const direction = move.getStepDirection();
        let { row, col } = move.from;
        const { row: toRow, col: toCol } = move.to;
        let hasEaten = false;

        while (row !== toRow || col !== toCol) {
            row += direction.row;
            col += direction.col;

            const currentCell = board[row][col];
            if (!currentCell.isEmpty) {
                if (currentCell.isWhite === this.isWhite || hasEaten) return false;
                hasEaten = true;
            }
        }
        return hasEaten;
    };
};
