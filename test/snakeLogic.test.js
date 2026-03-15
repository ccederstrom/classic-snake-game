import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  getRandomFoodPosition,
  setDirection,
  tick,
} from '../src/snakeLogic.js';

test('snake moves one cell in current direction on tick', () => {
  let state = createInitialState(10);
  state = { ...state, isPaused: false };
  const moved = tick(state);

  assert.deepEqual(moved.snake[0], { x: 6, y: 5 });
  assert.equal(moved.score, 0);
});

test('snake grows and increments score when eating food', () => {
  let state = createInitialState(10);
  state = {
    ...state,
    isPaused: false,
    food: { x: 6, y: 5 },
  };

  const moved = tick(state, () => 0);

  assert.equal(moved.snake.length, state.snake.length + 1);
  assert.equal(moved.score, 1);
  assert.notDeepEqual(moved.food, moved.snake[0]);
});

test('reverse direction inputs are ignored', () => {
  const state = createInitialState(10);
  const updated = setDirection(state, 'left');

  assert.equal(updated.pendingDirection, 'right');
});

test('collision with wall ends game', () => {
  const state = {
    ...createInitialState(4),
    snake: [{ x: 3, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 0 }],
    direction: 'right',
    pendingDirection: 'right',
    isPaused: false,
  };

  const moved = tick(state);
  assert.equal(moved.isGameOver, true);
});

test('food placement skips occupied cells', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  const food = getRandomFoodPosition(2, snake, () => 0);
  assert.deepEqual(food, { x: 1, y: 1 });
});
