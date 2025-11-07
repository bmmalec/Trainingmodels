# Medieval Realms

A web-based medieval strategy game inspired by Lords of the Realm II, featuring a procedurally-generated UK map with territory conquest mechanics.

## Features

- **Procedural Map Generation**: Each game creates a unique UK-inspired map with 35 territories using Voronoi diagrams
- **Territory-Based Gameplay**: Capture and control territories across medieval Britain
- **Resource Management**: Collect resources from controlled territories and manage your armies
- **AI Opponents**: Play against 3 AI opponents with strategic decision-making
- **Medieval Theming**: Authentic medieval-style territory names and game aesthetics

## How to Play

1. Open `index.html` in a modern web browser
2. The map will generate with territories distributed among 4 players (you are House Lancaster - red)
3. Click on your territory to select it
4. Click on an adjacent enemy territory to attack
5. Conquer all territories to win!

## Game Mechanics

### Territory Control
- Each territory has:
  - **Army**: Military strength for attacking and defending
  - **Population**: Number of inhabitants
  - **Resources**: Economic value that generates income each turn
  - **Adjacency**: Only adjacent territories can be attacked

### Combat
- Select one of your territories, then click an adjacent enemy territory to attack
- Combat success depends on army size and territory resources
- Winning armies lose about 30% of forces
- Losing armies lose about 50% of forces

### Resources
- Each turn, territories generate resources based on their resource value
- Resources are collected automatically at the end of each turn
- All territories receive +1 army reinforcement per turn

### Victory
- Eliminate all opponents by conquering all their territories
- Last player standing wins!

## Controls

- **Left Click**: Select territory / Attack enemy territory
- **End Turn Button**: Complete your turn and pass to next player
- **New Game Button**: Start a fresh game with a new map

## AI Behavior

AI players will:
- Attack when they have a significant strength advantage (1.5x or more)
- Fortify border territories when not attacking
- Make decisions based on army strength and territory positioning

## Technology

Built with vanilla JavaScript, HTML5 Canvas, and CSS. No external dependencies required.

- **Voronoi Diagrams**: For natural-looking territory boundaries
- **Canvas Rendering**: Smooth graphics and animations
- **Event-Driven Architecture**: Responsive gameplay

## File Structure

```
medieval-realms/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Game styling
└── js/
    ├── config.js       # Game configuration
    ├── utils.js        # Utility functions
    ├── voronoi.js      # Map generation
    ├── territory.js    # Territory class
    ├── player.js       # Player management
    ├── map.js          # Map controller
    ├── renderer.js     # Graphics rendering
    ├── ui.js           # UI controller
    ├── game.js         # Main game logic
    └── main.js         # Entry point
```

## Credits

Inspired by:
- Lords of the Realm II (1996)
- openfront.io and similar territory conquest games
- Medieval British history and geography
