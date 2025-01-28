'use strict'

import { Renderer } from "./dom/renderer.js";
import { Game } from "./logic/game.js";
import { createEventEmitter } from "./services/evet-bus.service.js";

const elGamesContainer = document.querySelector('.games-container');

createGame();
document.querySelector('.add-game-btn').addEventListener('click', createGame);
function createGame(event) {
    if (event)
        event.stopPropagation();
    const gameEvent =  createEventEmitter();
    const elGameContainer = document.createElement('div');
    const game = new Game(gameEvent);
    elGameContainer.classList.add('game-container');
    new Renderer(elGameContainer, game, gameEvent).renderGame();
    elGamesContainer.appendChild(elGameContainer);
}
