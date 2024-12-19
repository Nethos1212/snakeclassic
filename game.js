// Initialize game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const muteButton = document.getElementById('muteButton');

// Game constants
const gridSize = 20;
const gameSpeed = 100; // Game speed (lower = faster)
let tileCount;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let score = 0;
let gameLoop;
let isMuted = false;

// Game setup
function resizeCanvas() {
    canvas.width = Math.floor((window.innerWidth - 20) / gridSize) * gridSize;
    canvas.height = Math.floor((window.innerHeight - 20) / gridSize) * gridSize;
    tileCount = Math.min(
        Math.floor(canvas.width / gridSize),
        Math.floor(canvas.height / gridSize)
    );
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Sound effects
const eatSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrX19fX19fX5OTk5OTk8vLy8vLy////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCgAAAAAAAAAVY82AhbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALACwAAP/AADwQKVE9YWDGPkQWpT66yk4+zIiYPoTUaT3tnU+NFRUWQKXjaEWQKXjaEWQKXjaEWQKXjaEWQKXjQAAAAP/jGMQRC//K/f3+/vv/BP/6/z+CsEg+WTkkHykFaUtLqb2OZ67m/f//xf/+/F8Xy+D4PEg+D4PF8HwfB8HwfB8HwfB8HwfB8AAAAAAAAAAAAAAA/+MYxBYLAAJkAVEQABYQDkhaXVMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/4xjEIgvIAlYBTBABqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');

const gameOverSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrX19fX19fX5OTk5OTk8vLy8vLy////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCgAAAAAAAAAVY82AhbwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAALACwAAP/AADwQKVE9YWDGPkQWpT66yk4+zIiYPoTUaT3tnU+NFRUWQKXjaEWQKXjaEWQKXjaEWQKXjaEWQKXjQAAAAP/jGMQRC//K/f3+/vv/BP/6/z+CsEg+WTkkHykFaUtLqb2OZ67m/f//xf/+/F8Xy+D4PEg+D4PF8HwfB8HwfB8HwfB8HwfB8AAAAAAAAAAAAAAA/+MYxBYLAAJkAVEQABYQDkhaXVMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTkuNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/4xjEIgvIAlYBTBABqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');

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
    if (button) {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            switch(direction) {
                case 'upBtn': if (dy !== 1) { dx = 0; dy = -1; } break;
                case 'downBtn': if (dy !== -1) { dx = 0; dy = 1; } break;
                case 'leftBtn': if (dx !== 1) { dx = -1; dy = 0; } break;
                case 'rightBtn': if (dx !== -1) { dx = 1; dy = 0; } break;
            }
        });
    }
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
    
    if (hasEatenFood()) {
        generateFood();
    }
    
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
        if (!isMuted) {
            try {
                eatSound.currentTime = 0;
                eatSound.play().catch(() => {});
            } catch (e) {}
        }
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
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
    if (!isMuted) {
        try {
            gameOverSound.currentTime = 0;
            gameOverSound.play().catch(() => {});
        } catch (e) {}
    }
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
async function loadGameState() {
    const savedState = localStorage.getItem('snakeGameState');
    
    if (savedState) {
        try {
            const gameState = JSON.parse(savedState);
            snake = gameState.snake;
            food = gameState.food;
            score = gameState.score;
            dx = gameState.dx;
            dy = gameState.dy;
            scoreElement.textContent = `Score: ${score}`;
        } catch (error) {
            console.log('Error parsing saved game state:', error);
            // If there's an error parsing the saved state, start a new game
            generateFood();
        }
    }
}

// Save game state periodically
setInterval(saveGameState, 1000);

// Start the game
window.addEventListener('load', async () => {
    await loadGameState();
    generateFood();
    drawGame();
});
