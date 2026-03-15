import {
  createInitialState,
  restartGame,
  setDirection,
  tick,
  togglePause,
} from './snakeLogic.js';

const boardElement = document.querySelector('#board');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const statusElement = document.querySelector('#status');
const pauseButton = document.querySelector('#pause-btn');
const restartButton = document.querySelector('#restart-btn');
const directionButtons = document.querySelectorAll('[data-dir]');

const GRID_SIZE = 16;
const TICK_MS = 140;

let highScore = 0;
let state = createInitialState(GRID_SIZE);

setupBoard();
render();

setInterval(() => {
  state = tick(state);
  if (state.score > highScore) {
    highScore = state.score;
  }
  render();
}, TICK_MS);

window.addEventListener('keydown', (event) => {
  const keyDirectionMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right',
    W: 'up',
    S: 'down',
    A: 'left',
    D: 'right',
  };

  if (event.code === 'Space') {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  const mapped = keyDirectionMap[event.key];
  if (!mapped) return;

  event.preventDefault();
  state = setDirection(state, mapped);
  render();
});

directionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const direction = button.getAttribute('data-dir');
    state = setDirection(state, direction);
    render();
  });
});

pauseButton.addEventListener('click', () => {
  state = togglePause(state);
  render();
});

restartButton.addEventListener('click', () => {
  state = restartGame(state);
  render();
});

function setupBoard() {
  boardElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    fragment.appendChild(cell);
  }
  boardElement.replaceChildren(fragment);
}

function render() {
  const cells = boardElement.children;

  for (const cell of cells) {
    cell.className = 'cell';
  }

  for (const segment of state.snake) {
    const index = segment.y * state.gridSize + segment.x;
    cells[index].classList.add('snake');
  }

  const [head] = state.snake;
  const headIndex = head.y * state.gridSize + head.x;
  cells[headIndex].classList.add('head');

  if (state.food) {
    const foodIndex = state.food.y * state.gridSize + state.food.x;
    cells[foodIndex].classList.add('food');
  }

  scoreElement.textContent = String(state.score);
  highScoreElement.textContent = String(highScore);
  pauseButton.textContent = state.isPaused ? 'Resume' : 'Pause';

  if (state.isGameOver) {
    statusElement.textContent = 'Game over. Press Restart to play again.';
  } else if (state.isPaused) {
    statusElement.textContent = 'Paused. Press Space or Resume.';
  } else {
    statusElement.textContent = 'Running';
  }
}
