export const Modal = function (gameInstance, gameEvent, startNewGame) {
    let modal;
    const game = gameInstance;

    this.startGame = (event) => {
        event.stopPropagation();
        startNewGame();
        modal.querySelector('.start-game-btn').classList.add('display-none', 'opacity');
        this.closeModal();
        modal.querySelector('.modal-header').classList.remove('display-none')
        setupEventListeners();
    }
    this.closeModal = () => {
        modal.classList.remove('open');
        gameEvent.emit('modal-closed', {});
    }
    this.openModal = () => {
        modal.classList.add('open');
        gameEvent.emit('modal-opened', {});
    }
    const onNoBtnClick = () => {
        this.closeModal(); modal.querySelector('.btn-container').classList.add('display-none', 'opacity');
    }

    const setupEventListeners = () => {
        modal.querySelector('.no-btn').addEventListener('click', onNoBtnClick);
        gameEvent.on('turnchanged', changeTurn);
        gameEvent.on('gameover', announceGameResult);
    }
    const createModal = () => {
        const elModal = document.createElement('div');
        elModal.classList.add('modal', 'open');
        elModal.innerHTML = `
        <h1 class="modal-header small display-none">Are you sure?</h1>
        <div class="btn-container display-none opacity">
        <button class="yes-btn">Yes</button>
        <button class="no-btn">No</button>
        </div>
        `;
        const elPlayBtn = document.createElement('button');
        elPlayBtn.classList.add('start-game-btn');
        elPlayBtn.textContent = 'Play';
        elPlayBtn.addEventListener('click', this.startGame);
        elModal.appendChild(elPlayBtn);
        modal = elModal;
        return elModal;
    }
    const announceGameResult = ({ isWhiteTurn, isWinning = false }) => {
        modal.querySelector('.btn-container').classList.add('display-none', 'opacity');
        const elModalTxt = modal.querySelector('.modal-header');
        elModalTxt.innerHTML = isWinning ? `${isWhiteTurn ? 'White' : 'Black'} wins!` : 'It\'s a draw!';
        elModalTxt.classList.toggle('black', !isWhiteTurn);
        const elStartGameBtn = modal.querySelector('.start-game-btn')
        elStartGameBtn.innerHTML = 'Play again';
        elStartGameBtn.classList.remove('display-none', 'opacity');
        setTimeout(this.openModal, 50);
        setTimeout(() => elStartGameBtn.classList.remove('opacity'), 500);
    }
    const changeTurn = ({isWhiteTurn}) => {
        const turnTxt = `${isWhiteTurn ? 'White' : 'Black'} turn`;
        const elModalTxt = modal.querySelector('.modal-header');
        elModalTxt.classList.toggle('black', !isWhiteTurn);
        elModalTxt.innerHTML = turnTxt;
        setTimeout(this.openModal, 50);
        setTimeout(this.closeModal, 1000);
    }
    gameEvent.on('resign', () => {
        modal.querySelector('.yes-btn').addEventListener('click', () => announceGameResult({ isWhiteTurn: !game.isWhiteTurn(), isWinning: true }));
        modal.querySelector('.btn-container').classList.remove('display-none', 'opacity');
        modal.querySelector('.modal-header').textContent = 'Do you want to resign?';
        this.openModal();
    })
    gameEvent.on('draw', () => {
        modal.querySelector('.yes-btn').addEventListener('click', () => announceGameResult({ isWhiteTurn: true }));
        modal.querySelector('.btn-container').classList.remove('display-none', 'opacity');
        modal.querySelector('.modal-header').textContent = 'Do you agree for a draw?';
        this.openModal();
    })
    return createModal();
}
