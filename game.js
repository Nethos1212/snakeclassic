// Initialize game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Responsive canvas sizing
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const size = Math.min(container.clientWidth, window.innerHeight * 0.7);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.width = canvas.height = 400; // Keep internal resolution constant
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game constants
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 100;
let gameLoop;
let isMuted = false;

// Sound effects
const eatSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
const gameOverSound = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');

// Sound control
document.querySelector('.sound-control').addEventListener('click', () => {
    isMuted = !isMuted;
    const icon = document.querySelector('.sound-control i');
    icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
});

// Mobile controls
const touchControls = {
    upBtn: document.getElementById('upBtn'),
    leftBtn: document.getElementById('leftBtn'),
    downBtn: document.getElementById('downBtn'),
    rightBtn: document.getElementById('rightBtn')
};

Object.entries(touchControls).forEach(([direction, button]) => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        switch(direction) {
            case 'upBtn': if (dy !== 1) { dx = 0; dy = -1; } break;
            case 'downBtn': if (dy !== -1) { dx = 0; dy = 1; } break;
            case 'leftBtn': if (dx !== 1) { dx = -1; dy = 0; } break;
            case 'rightBtn': if (dx !== -1) { dx = 1; dy = 0; } break;
        }
    });
});

// Keyboard controls
function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) { dx = -1; dy = 0; }
    if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -1; }
    if (keyPressed === RIGHT_KEY && !goingLeft) { dx = 1; dy = 0; }
    if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = 1; }
}

document.addEventListener('keydown', changeDirection);

// Game functions
function drawGame() {
    clearCanvas();
    moveSnake();
    
    if (hasGameEnded()) {
        gameOver();
        return;
    }
    
    checkFoodCollision();
    drawFood();
    drawSnake();
    
    gameLoop = setTimeout(drawGame, gameSpeed);
}

function clearCanvas() {
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#2ecc71';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (!hasEatenFood()) {
        snake.pop();
    }
}

function hasEatenFood() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        if (!isMuted) eatSound.play();
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
        generateFood();
        return true;
    }
    return false;
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    const foodOnSnake = snake.some(segment => segment.x === food.x && segment.y === food.y);
    if (foodOnSnake) generateFood();
}

function hasGameEnded() {
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= tileCount;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= tileCount;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    if (!isMuted) gameOverSound.play();
    clearTimeout(gameLoop);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 80);
    
    document.addEventListener('keydown', function restart(event) {
        if (event.code === 'Space') {
            snake = [{ x: 10, y: 10 }];
            dx = 0;
            dy = 0;
            score = 0;
            scoreElement.textContent = 'Score: 0';
            generateFood();
            document.removeEventListener('keydown', restart);
            drawGame();
        }
    });
}

// Save game progress
function saveGameState() {
    const gameState = {
        snake,
        food,
        score,
        dx,
        dy
    };
    localStorage.setItem('snakeGameState', JSON.stringify(gameState));
}

// Load game progress
function loadGameState() {
    const savedState = localStorage.getItem('snakeGameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        snake = gameState.snake;
        food = gameState.food;
        score = gameState.score;
        dx = gameState.dx;
        dy = gameState.dy;
        scoreElement.textContent = `Score: ${score}`;
    }
}

// Save game state periodically
setInterval(saveGameState, 1000);

// Start the game
window.addEventListener('load', () => {
    loadGameState();
    generateFood();
    drawGame();
});
