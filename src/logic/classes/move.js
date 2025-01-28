'use strict';

export const Move = function (from, to) {
    this.from = ({row: parseInt(from.row), col: parseInt(from.col)});
    this.to = ({row: parseInt(to.row), col: parseInt(to.col)});

    this.getFrom = () => {
        return this.from;
    };
    this.getTo = () => {
        return this.to;
    };
    this.setFrom = (from) => {
        this.from = from;
    };
    this.setTo = (to) => {
        this.to = to;
    };
    this.getRowsDiff = () => {
        return getDiff(this.from.row, this.to.row);
    };
    this.getColsDiff = () => {
        return getDiff(this.from.col, this.to.col);
    };
    const getDiff = (from, to) => {
        return Math.abs(from - to);
    }
    this.getDirection = () => {
        return {
            row: this.to.row - this.from.row,
            col: this.to.col - this.from.col
        };
    };
    this.getStepDirection = () => {
        const rowDirection = this.to.row > this.from.row ? 1 : -1;
        const colDirection = this.to.col > this.from.col ? 1 : -1;
        return { row: rowDirection, col: colDirection };
    }
    this.isDiagonal = () => {
        return this.getRowsDiff() === this.getColsDiff();
    };
    this.isVertical = () => {
        return this.from.col === this.to.col;
    };
    this.isHorizontal = () => {
        return this.from.row === this.to.row;
    };
    this.isEqual = (move) => {
        return this.from.row === move.from.row &&
            this.from.col === move.from.col &&
            this.to.row === move.to.row &&
            this.to.col === move.to.col;
    };
    this.isStationary = () => {
        return this.getRowsDiff() === 0 && this.getColsDiff() === 0;
    }
}