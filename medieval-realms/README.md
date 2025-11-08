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

### Territory Information Display
Each territory displays:
- **Army Number**: White circle with bold number showing army count
- **Territory Name**: Name displayed below the army count
- **Color**: Territory color indicates the controlling player
- **Borders**: Territories share borders with adjacent territories

### Territory Control
Each territory has these properties:
- **Army**: Military strength for attacking and defending (displayed in center)
- **Population**: Number of inhabitants (50-200 at start)
- **Resources**: Economic value that generates income each turn (50-150 at start)
- **Name**: Procedurally generated medieval British name
- **Adjacency**: Only adjacent territories can be attacked

### Combat System

#### Attacking
1. **Select Your Territory**: Click on one of your territories (highlighted in your color)
2. **Choose Target**: Click on an adjacent enemy territory
3. **Requirements**: Your attacking territory must have at least 2 armies

#### Combat Resolution
- **Strength Calculation**:
  - Attack Strength = Army Size × (1 + Resources/500)
  - Defense Strength = Army Size × (1 + Resources/500)
  - Win Chance = Attack Strength / (Attack Strength + Defense Strength)

- **Victory**:
  - Attacker wins based on calculated probability
  - Winner loses approximately 30% of their armies
  - Winner captures the territory
  - Winning armies split: 50% move to captured territory, 50% stay

- **Defeat**:
  - Attacker loses approximately 50% of their armies
  - Defender keeps the territory
  - Territory remains under defender's control

#### Example Battle:
```
Attacker: 20 armies + 100 resources = Strength of ~24
Defender: 12 armies + 80 resources = Strength of ~13.9

Win Chance: 24/(24+13.9) = 63% chance of victory

If attacker wins:
- Loses 6 armies (30% of 20)
- Remaining 14 armies split: 7 stay, 7 occupy new territory
- Captured territory now has 7 armies

If attacker loses:
- Loses 10 armies (50% of 20)
- Territory still has 10 armies left
- Defender keeps territory
```

### Economic System

#### Resource Generation
- **Rate**: Each territory generates resources = Resource Value ÷ 10 per turn
- **Example**: Territory with 100 resource value generates 10 resources/turn
- **Collection**: Automatically collected at end of your turn
- **Display**: Total resources shown in player panel with 💰 icon

#### Army Reinforcement
- **Automatic**: All your territories receive +1 army at end of turn
- **Manual**: (Future feature) Spend resources to buy additional armies

### Turn Structure

1. **Your Turn Begins**
   - Select and attack enemy territories
   - Plan your strategy
   - View territory information

2. **End Turn** (click "End Turn" button)
   - Collect resources from all territories
   - Each territory receives +1 army
   - Turn passes to next player

3. **AI Turns** (automated)
   - AI evaluates attack opportunities
   - AI attacks if it has 1.5x+ strength advantage
   - AI fortifies border territories when not attacking

### Victory Conditions
- **Win**: Conquer all territories on the map
- **Elimination**: Lose all your territories
- **Victory Screen**: Displays when one player controls entire UK

### Strategy Tips
- **Build Up**: Accumulate armies on border territories before attacking
- **Target Weak**: Attack territories with fewer armies for higher win chance
- **Protect Borders**: Keep strong armies on territories adjacent to enemies
- **Resource Value**: High-resource territories generate more income over time
- **Population**: Currently cosmetic, but could affect future mechanics

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

Built with vanilla JavaScript, HTML5 Canvas, and CSS, with optional Node.js/Express server for deployment.

- **Voronoi Diagrams**: For natural-looking territory boundaries
- **Canvas Rendering**: Smooth graphics and animations
- **Event-Driven Architecture**: Responsive gameplay
- **Express Server**: For Azure App Service deployment (Node.js 22)

## File Structure

```
medieval-realms/
├── index.html          # Main HTML file
├── package.json        # Node.js dependencies (Express)
├── server.js           # Express server for deployment
├── css/
│   └── styles.css      # Game styling
└── js/
    ├── config.js       # Game configuration
    ├── utils.js        # Utility functions
    ├── voronoi.js      # Map generation algorithm
    ├── territory.js    # Territory class and mechanics
    ├── player.js       # Player management and AI
    ├── map.js          # Map controller
    ├── renderer.js     # Graphics rendering engine
    ├── ui.js           # UI controller
    ├── game.js         # Main game logic
    └── main.js         # Entry point
```

## Deployment

### Local Testing
Simply open `index.html` in a modern web browser. No server required for local play.

### Azure App Service
The game includes an Express server for deployment to Azure App Service:
1. Requires Node.js 22 LTS
2. Run `npm install` to install dependencies
3. Run `npm start` to start server on port 8080 (or PORT env variable)
4. Access at `http://localhost:8080`

See `azure-pipelines.yml` in the parent directory for automated deployment configuration.

## Credits

Inspired by:
- Lords of the Realm II (1996)
- openfront.io and similar territory conquest games
- Medieval British history and geography
