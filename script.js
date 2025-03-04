document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Game variables
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval;
    let gameSpeed = 100;
    let gameRunning = false;
    let powerUp = null;
    let powerUpActive = false;
    let powerUpTimer = null;
    let particles = [];

    // Power-up types
    const POWER_UPS = {
        SPEED: { color: '#FFD700', duration: 5000, effect: 'speed' },
        DOUBLE_POINTS: { color: '#FF1493', duration: 8000, effect: 'points' }
    };
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startButton = document.getElementById('start-btn');
    const resetButton = document.getElementById('reset-btn');
    
    // Initialize high score display
    highScoreElement.textContent = highScore;
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Initialize game
    function initGame() {
        // Create snake
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        
        // Set initial direction
        direction = 'right';
        nextDirection = 'right';
        
        // Reset score
        score = 0;
        scoreElement.textContent = score;
        
        // Create initial food
        createFood();
        
        // Draw initial state
        draw();
    }
    
    // Start game
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            initGame();
            gameInterval = setInterval(gameLoop, gameSpeed);
            startButton.textContent = 'Pause';
        } else {
            gameRunning = false;
            clearInterval(gameInterval);
            startButton.textContent = 'Resume';
        }
    }
    
    // Reset game
    function resetGame() {
        clearInterval(gameInterval);
        gameRunning = false;
        startButton.textContent = 'Start Game';
        initGame();
    }
    
    // Create food at random position
    function createFood() {
        food = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // Make sure food doesn't appear on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                createFood(); // Try again
                break;
            }
        }
    }
    
    // Handle keyboard input
    function handleKeyPress(event) {
        const key = event.key;
        
        // Prevent reversing direction directly
        switch(key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    }
    
    // Main game loop
    function gameLoop() {
        update();
        draw();
    }
    
    // Update game state
    function update() {
        // Update direction
        direction = nextDirection;
        
        // Create new head based on direction
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch(direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Check for wall collision
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            gameOver();
            return;
        }
        
        // Check for self collision
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check for food collision
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Create new food
            createFood();
            
            // Increase speed slightly
            if (gameSpeed > 50) {
                clearInterval(gameInterval);
                gameSpeed -= 5;
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        } else {
            // Remove tail if no food eaten
            snake.pop();
        }
    }
    
    // Draw game
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Head is a different color
            if (index === 0) {
                ctx.fillStyle = '#4CAF50'; // Green head
            } else {
                ctx.fillStyle = '#8BC34A'; // Lighter green body
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        });
        
        // Draw food
        ctx.fillStyle = '#FF5722'; // Orange food
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
    }
    
    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        gameRunning = false;
        startButton.textContent = 'Start Game';
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Initialize the game on load
    initGame();
});