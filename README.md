# Snake Game

A modern, web-based implementation of the classic Snake game built with HTML5 Canvas, JavaScript, and CSS. This game features smooth animations, responsive controls, and a sleek user interface.

## Features

- Smooth snake movement and controls
- Score tracking system
- Local storage-based high score persistence
- Responsive design with modern UI
- Progressive game speed increase
- Pause/Resume functionality
- Game over screen with final score display

## Demo

Play the game by opening `index.html` in your web browser or hosting it on a local server.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/snake_game.git
   ```
2. Navigate to the project directory:
   ```bash
   cd snake_game
   ```
3. Open `index.html` in your web browser or set up a local server

## How to Play

- Use the **Arrow Keys** to control the snake's direction
- Eat the food (orange squares) to grow longer and earn points
- Avoid hitting the walls or the snake's own body
- Try to achieve the highest score possible
- Use the "Start Game" button to begin
- Use the "Reset Game" button to start over

## Technical Details

### Technologies Used

- HTML5 Canvas for game rendering
- Vanilla JavaScript for game logic
- CSS3 for styling and animations
- Local Storage API for high score persistence

### Game Features

- **Responsive Controls**: Smooth and responsive keyboard controls
- **Dynamic Speed**: Game speed increases as you collect more food
- **Score System**: Points are awarded for each food item collected
- **High Score Tracking**: Local storage maintains the highest score across sessions
- **Game State Management**: Proper handling of game states (running, paused, game over)

## Project Structure

```
├── index.html      # Main HTML file with game structure
├── style.css       # CSS styles for game appearance
├── script.js       # JavaScript game logic
└── README.md       # Project documentation
```

## Development

The game is built with vanilla JavaScript and uses the following key components:

- Canvas API for rendering game elements
- RequestAnimationFrame for smooth animations
- Event listeners for keyboard input
- Local Storage for data persistence

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by the classic Snake game
- Modern implementation with web technologies
- Built with performance and user experience in mind