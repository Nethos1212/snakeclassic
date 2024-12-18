# Snake Classic

### Technical Requirements

- Games must be built using HTML5
- Games should work well on both desktop and mobile devices
- Must support various screen sizes
- Should load quickly and be optimized for mobile data

### Integration Requirements

1. Include the Telegram Web App JS file in your game:
```html
<script src="https://telegram.org/js/games.js"></script>
```

2. Essential game events to implement:
```javascript
// Initialize the game
TelegramGameProxy.initParams();

// Report score to Telegram
TelegramGameProxy.shareScore();
```

### Best Practices

1. Keep the initial loading size small
2. Implement progressive loading if needed
3. Use responsive design principles
4. Implement sound controls (mute/unmute)
5. Save game progress when possible

## Step 4: Development Structure

Create the following files for your game:

1. `index.html` - Main game page
2. `game.js` - Game logic
3. `styles.css` - Game styling
4. `assets/` - Directory for images, sounds, etc.

## How to Play

1. Open `index.html` in your web browser
2. Use arrow keys to control the snake
3. Eat the red food to grow and score points
4. Avoid hitting the walls and yourself
5. Press Space to restart when game is over

## Features

- Smooth snake movement
- Score tracking
- Collision detection
- Game over screen with restart option
- Responsive design

## Technical Details

The game is built using:
- HTML5 Canvas for rendering
- Vanilla JavaScript for game logic
- CSS for styling

No external dependencies required!
