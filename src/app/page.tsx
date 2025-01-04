'use client';
import { useRef, useEffect, useState } from 'react';
import {
  IconPlayerStop,
  IconArrowDown,
  IconArrowUp,
  IconArrowLeft,
  IconArrowRight,
} from '@tabler/icons-react';

const Colors = {
  BACKGROUND: 'black',
  SNAKE: '#97f06c',
};

const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  STOP: 'STOP',
};

let mapSize = 20;
let gridSize = 25;
let gameSpeed = 100;
let panelHeight = mapSize;
let panelWidth = mapSize;

if (typeof window !== 'undefined' && window.innerWidth < 768) {
  mapSize = 18;
  gridSize = 20;
  gameSpeed = 100;
  panelHeight = mapSize;
  panelWidth = mapSize;
}

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [speed, setSpeed] = useState(gameSpeed);
  const [snake, setSnake] = useState({
    x: Math.floor(panelWidth / 2) * gridSize,
    y: Math.floor(panelHeight / 2) * gridSize,
  });
  const [tailX, setTailX] = useState([snake.x]);
  const [tailY, setTailY] = useState([snake.y]);
  const [tailLength, setTailLength] = useState(0);
  const [food, setFood] = useState({
    x: Math.floor(Math.random() * (panelWidth - 1)) * gridSize,
    y: Math.floor(Math.random() * (panelHeight - 1)) * gridSize,
  });

  const [direction, setDirection] = useState(Direction.STOP);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);

  useEffect(() => {
    snakeRef.current = snake;
    directionRef.current = direction;
  }, [snake, direction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const drawGame = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      context.fillStyle = Colors.BACKGROUND;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern
      for (let i = 0; i < panelWidth; i++) {
        for (let j = 0; j < panelHeight; j++) {
          context.fillStyle = (i + j) % 2 === 0 ? '#414368' : '#373A59';
          context.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
          context.strokeStyle = 'black';
          context.strokeRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
      }

      // Draw food
      context.fillStyle = 'red';
      context.fillRect(food.x, food.y, gridSize, gridSize);

      // Draw snake's tail
      for (let i = 0; i < tailLength; i++) {
        context.fillStyle = Colors.SNAKE;
        context.fillRect(tailX[i], tailY[i], gridSize, gridSize);
        context.strokeStyle = 'black';
        context.strokeRect(tailX[i], tailY[i], gridSize, gridSize);
      }

      // Draw snake's head
      context.fillStyle = Colors.SNAKE;
      context.fillRect(snake.x, snake.y, gridSize, gridSize);
    };

    const logic = () => {
      // Move tail
      const newTailX = [...tailX];
      const newTailY = [...tailY];
      let prevX = snake.x;
      let prevY = snake.y;

      for (let i = 0; i < tailLength; i++) {
        const currentX = newTailX[i];
        const currentY = newTailY[i];
        newTailX[i] = prevX;
        newTailY[i] = prevY;
        prevX = currentX;
        prevY = currentY;
      }

      setTailX(newTailX);
      setTailY(newTailY);

      // Move snake
      switch (direction) {
        case Direction.UP:
          setSnake((prev) => ({ ...prev, y: prev.y - gridSize }));
          break;
        case Direction.DOWN:
          setSnake((prev) => ({ ...prev, y: prev.y + gridSize }));
          break;
        case Direction.LEFT:
          setSnake((prev) => ({ ...prev, x: prev.x - gridSize }));
          break;
        case Direction.RIGHT:
          setSnake((prev) => ({ ...prev, x: prev.x + gridSize }));
          break;
        case Direction.STOP:
          break;
      }

      // Check border collision
      if (
        snake.x < 0 ||
        snake.x >= panelWidth * gridSize ||
        snake.y < 0 ||
        snake.y >= panelHeight * gridSize
      ) {
        setGameOver(true);
      }

      // Check if snake eats food
      if (snake.x === food.x && snake.y === food.y) {
        setFood({
          x: Math.floor(Math.random() * (panelWidth - 1)) * gridSize,
          y: Math.floor(Math.random() * (panelHeight - 1)) * gridSize,
        });
        setScore((prev) => prev + 1);
        setTailLength((prev) => prev + 1);
        setSpeed((prev) => (prev > 50 ? prev - 2 : prev));
      }

      // Check self-collision
      for (let i = 0; i < tailLength; i++) {
        if (tailX[i] === snake.x && tailY[i] === snake.y) {
          setGameOver(true);
          break;
        }
      }
    };

    const gameInterval = setInterval(() => {
      drawGame();
      logic();
    }, speed);

    return () => {
      clearInterval(gameInterval);
    };
  }, [snake, food, direction]);

  //event listener for keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        if (direction !== Direction.DOWN) {
          setDirection(Direction.UP);
        }
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        if (direction !== Direction.UP) {
          setDirection(Direction.DOWN);
        }
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (direction !== Direction.RIGHT) {
          setDirection(Direction.LEFT);
        }
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        if (direction !== Direction.LEFT) {
          setDirection(Direction.RIGHT);
        }
      }
      if (e.key === ' ') {
        setDirection(Direction.STOP);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction]);

  if (gameOver) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center flex flex-col items-center gap-3">
          <h1 className="text-4xl font-bold text-red-300">Game Over</h1>
          <h2 className="text-2xl">Score : {score}</h2>
          <button
            className="btn border-black font-bold p-3 bg-black rounded-lg"
            onClick={() => window.location.reload()}
            autoFocus
          >
            Restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center h-screen flex-col gap-3">
      <div className="text-center">
        {/* แสดงเฉพาะบนหน้าจอที่ใหญ่กว่า md */}
        <h1 className="text-4xl font-bold text-white">Snake Game</h1>
        <p className="text-lg text-white hidden md:block">
          Use arrow keys or WASD to move the snake
        </p>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Score : {score}</h1>
      </div>

      <canvas
        ref={canvasRef}
        width={panelWidth * gridSize}
        height={panelHeight * gridSize}
        style={{
          backgroundColor: Colors.BACKGROUND,
          border: '1px solid black',
        }}
      ></canvas>

      {/* แสดงเฉพาะบนหน้าจอที่เล็กกว่า md */}
      <div className="flex gap-1 flex-col md:hidden">
        <div className="flex gap-3 justify-between">
          <p className="text-center">&nbsp;</p>
          <button
            className="btn border-black font-bold p-3 bg-black rounded-lg text-center "
            onClick={() => setDirection(Direction.UP)}
          >
            <IconArrowUp size={35} />
          </button>
          <p className="text-center">&nbsp;</p>
        </div>

        <div className="flex gap-1">
          <button
            className="btn border-black font-bold p-3 bg-black rounded-lg"
            onClick={() => setDirection(Direction.LEFT)}
          >
            <IconArrowLeft size={35} />
          </button>
          <button
            className="btn border-black font-bold p-3 bg-black rounded-lg"
            onClick={() => setDirection(Direction.STOP)}
          >
            <IconPlayerStop size={35} />
          </button>
          <button
            className="btn border-black font-bold p-3 bg-black rounded-lg"
            onClick={() => setDirection(Direction.RIGHT)}
          >
            <IconArrowRight size={35} />
          </button>
        </div>

        <div className="flex gap-3 justify-between">
          <p className="text-center">&nbsp;</p>
          <button
            className="btn border-black font-bold p-3 bg-black rounded-lg"
            onClick={() => setDirection(Direction.DOWN)}
          >
            <IconArrowDown size={35} />
          </button>
          <p className="text-center">&nbsp;</p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
