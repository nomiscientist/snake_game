import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

document.addEventListener('DOMContentLoaded', () => {
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x222222);
    document.getElementById('game-canvas').replaceWith(renderer.domElement);
    renderer.domElement.id = 'game-canvas';

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Setup camera and controls
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 10;
    controls.maxDistance = 30;

    // Add lighting and shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 15, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add grid and ground
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Game variables
    const gridSize = 1;
    const gridWidth = 20;
    const gridHeight = 20;
    const snakeGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const snakeMaterial = new THREE.MeshPhongMaterial({ color: 0x4CAF50 });
    const foodGeometry = new THREE.SphereGeometry(0.5);
    const foodMaterial = new THREE.MeshPhongMaterial({ color: 0xFF5722 });
    const snakeMeshes = [];
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
        // Update snake segments
        while (snakeMeshes.length > snake.length) {
            const mesh = snakeMeshes.pop();
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        while (snakeMeshes.length < snake.length) {
            const mesh = new THREE.Mesh(snakeGeometry, snakeMaterial.clone());
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            snakeMeshes.push(mesh);
            scene.add(mesh);

        // Update snake positions
        snake.forEach((segment, index) => {
            const mesh = snakeMeshes[index];
            mesh.position.set(
                segment.x - gridWidth/2,
                0.5,
                segment.y - gridHeight/2
            );
            if (index === 0) {
                mesh.material.color.setHex(0x4CAF50); // Head color
            } else {
                mesh.material.color.setHex(0x8BC34A); // Body color
            }
        });

        // Update food position
        if (!window.foodMesh) {
            window.foodMesh = new THREE.Mesh(foodGeometry, foodMaterial);
            scene.add(window.foodMesh);
        }
        window.foodMesh.position.set(
            food.x - gridWidth/2,
            0.5,
            food.y - gridHeight/2
        );

        // Render scene
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(draw);
    }
    
    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        gameRunning = false;
        startButton.textContent = 'Start Game';

        // Create game over text
        const gameOverText = document.createElement('div');
        gameOverText.style.position = 'absolute';
        gameOverText.style.top = '50%';
        gameOverText.style.left = '50%';
        gameOverText.style.transform = 'translate(-50%, -50%)';
        gameOverText.style.color = 'white';
        gameOverText.style.textAlign = 'center';
        gameOverText.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        gameOverText.style.padding = '20px';
        gameOverText.style.borderRadius = '10px';
        gameOverText.innerHTML = `
            <h2 style="margin: 0 0 10px 0">Game Over!</h2>
            <p style="margin: 0">Score: ${score}</p>
        `;

        // Add to game container
        const gameContainer = document.querySelector('.game-container');
        gameContainer.appendChild(gameOverText);

        // Remove after 3 seconds
        setTimeout(() => {
            gameContainer.removeChild(gameOverText);
        }, 3000);
    }
    
    // Initialize the game on load
    initGame();
});