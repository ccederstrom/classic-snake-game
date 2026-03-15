export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function createInitialState(gridSize = 16) {
  const center = Math.floor(gridSize / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    gridSize,
    snake,
    direction: 'right',
    pendingDirection: 'right',
    food: getRandomFoodPosition(gridSize, snake),
    score: 0,
    isGameOver: false,
    isPaused: true,
  };
}

export function setDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection]) return state;

  const referenceDirection = state.pendingDirection ?? state.direction;
  if (OPPOSITES[referenceDirection] === nextDirection) return state;

  return {
    ...state,
    pendingDirection: nextDirection,
    isPaused: false,
  };
}

export function togglePause(state) {
  if (state.isGameOver) return state;
  return { ...state, isPaused: !state.isPaused };
}

export function restartGame(state) {
  return createInitialState(state.gridSize);
}

export function tick(state, randomFn = Math.random) {
  if (state.isPaused || state.isGameOver) return state;

  const direction = state.pendingDirection ?? state.direction;
  const nextHead = moveHead(state.snake[0], direction);

  if (isWallCollision(nextHead, state.gridSize) || isSelfCollision(nextHead, state.snake)) {
    return { ...state, direction, isGameOver: true };
  }

  const willGrow = positionsEqual(nextHead, state.food);
  const nextSnake = [nextHead, ...state.snake];
  if (!willGrow) {
    nextSnake.pop();
  }

  const nextFood = willGrow
    ? getRandomFoodPosition(state.gridSize, nextSnake, randomFn)
    : state.food;

  return {
    ...state,
    direction,
    pendingDirection: direction,
    snake: nextSnake,
    food: nextFood,
    score: state.score + (willGrow ? 1 : 0),
  };
}

function moveHead(head, direction) {
  const vector = DIRECTIONS[direction];
  return { x: head.x + vector.x, y: head.y + vector.y };
}

function isWallCollision(position, gridSize) {
  return position.x < 0 || position.y < 0 || position.x >= gridSize || position.y >= gridSize;
}

function isSelfCollision(position, snake) {
  return snake.some((segment) => positionsEqual(position, segment));
}

function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function getRandomFoodPosition(gridSize, snake, randomFn = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * freeCells.length);
  return freeCells[index];
}
