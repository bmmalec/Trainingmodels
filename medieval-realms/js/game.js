// Main game controller
class Game {
    constructor(config) {
        this.config = config;
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas, config);
        this.ui = new UIController(this);

        this.players = [];
        this.currentPlayerIndex = 0;
        this.territories = [];
        this.selectedTerritory = null;
        this.turn = 1;
        this.gameOver = false;

        this.setupEventListeners();
    }

    // Initialize a new game
    newGame() {
        console.log('Starting new game...');
        this.gameOver = false;
        this.turn = 1;
        this.selectedTerritory = null;

        // Create players
        this.players = [];
        for (let i = 0; i < this.config.NUM_PLAYERS; i++) {
            const player = new Player(
                i,
                this.config.PLAYER_NAMES[i],
                this.config.PLAYER_COLORS[i]
            );
            this.players.push(player);
        }

        // Generate map
        const gameMap = new GameMap(this.config);
        this.territories = gameMap.generate();

        // Distribute territories to players
        gameMap.distributeToPlayers(this.players);

        // Set starting player
        this.currentPlayerIndex = 0;

        // Update UI
        this.updateUI();
        this.renderer.render(this.territories);

        this.ui.addLogMessage('New game started! Conquer all territories to win!', 'info');
        console.log('Game initialized');
    }

    // Setup event listeners
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
    }

    // Handle canvas click
    handleCanvasClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedTerritory = this.getTerritoryAt(x, y);
        if (!clickedTerritory) return;

        const currentPlayer = this.players[this.currentPlayerIndex];

        // If no territory selected, select this one (if owned by current player)
        if (!this.selectedTerritory) {
            if (clickedTerritory.owner === currentPlayer) {
                this.selectedTerritory = clickedTerritory;
                this.ui.updateTerritoryInfo(clickedTerritory);
                this.renderer.render(this.territories, this.selectedTerritory);
                this.ui.addLogMessage(`Selected ${clickedTerritory.name}`, 'info');
            } else {
                this.ui.updateTerritoryInfo(clickedTerritory);
            }
        }
        // If territory selected, try to attack
        else {
            if (clickedTerritory === this.selectedTerritory) {
                // Deselect
                this.selectedTerritory = null;
                this.renderer.render(this.territories);
            } else if (clickedTerritory.owner === currentPlayer) {
                // Select different territory
                this.selectedTerritory = clickedTerritory;
                this.ui.updateTerritoryInfo(clickedTerritory);
                this.renderer.render(this.territories, this.selectedTerritory);
            } else if (this.selectedTerritory.adjacent.includes(clickedTerritory.id)) {
                // Attack adjacent enemy territory
                this.attack(this.selectedTerritory, clickedTerritory);
            } else {
                this.ui.addLogMessage('Can only attack adjacent territories!', 'info');
            }
        }
    }

    // Handle canvas hover
    handleCanvasHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const hoveredTerritory = this.getTerritoryAt(x, y);

        if (hoveredTerritory) {
            this.canvas.style.cursor = 'pointer';
            this.renderer.render(this.territories, this.selectedTerritory);
            this.renderer.highlightHovered(hoveredTerritory);
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    // Get territory at coordinates
    getTerritoryAt(x, y) {
        for (const territory of this.territories) {
            if (territory.containsPoint(x, y)) {
                return territory;
            }
        }
        return null;
    }

    // Attack a territory
    attack(fromTerritory, toTerritory) {
        const attacker = fromTerritory.owner;
        const defender = toTerritory.owner;

        if (fromTerritory.army < 2) {
            this.ui.addLogMessage('Need at least 2 armies to attack!', 'combat');
            return;
        }

        this.ui.addLogMessage(
            `${attacker.name} attacks ${toTerritory.name} from ${fromTerritory.name}!`,
            'combat'
        );

        // Calculate battle outcome
        const attackStrength = fromTerritory.getStrength();
        const defenseStrength = toTerritory.getStrength();
        const attackerWinChance = attackStrength / (attackStrength + defenseStrength);

        const attackerWins = Math.random() < attackerWinChance;

        if (attackerWins) {
            // Attacker wins
            const armyLoss = Math.ceil(fromTerritory.army * 0.3);
            fromTerritory.army -= armyLoss;

            // Transfer territory
            if (defender) {
                defender.removeTerritory(toTerritory);
            }
            attacker.addTerritory(toTerritory);
            toTerritory.army = Math.floor(fromTerritory.army * 0.5);
            fromTerritory.army -= toTerritory.army;

            this.ui.addLogMessage(
                `${attacker.name} conquered ${toTerritory.name}! Lost ${armyLoss} armies.`,
                'combat'
            );

            // Check for elimination
            if (defender && defender.eliminated) {
                this.ui.addLogMessage(
                    `${defender.name} has been eliminated!`,
                    'combat'
                );
            }

            // Check for victory
            this.checkVictory();
        } else {
            // Defender wins
            const armyLoss = Math.ceil(fromTerritory.army * 0.5);
            fromTerritory.army -= armyLoss;

            this.ui.addLogMessage(
                `${attacker.name}'s attack failed! Lost ${armyLoss} armies.`,
                'combat'
            );
        }

        this.selectedTerritory = null;
        this.updateUI();
        this.renderer.render(this.territories);
    }

    // End current turn
    endTurn() {
        if (this.gameOver) return;

        const currentPlayer = this.players[this.currentPlayerIndex];

        // Collect resources
        const resourcesGenerated = currentPlayer.collectResources();
        this.ui.addLogMessage(
            `${currentPlayer.name} collected ${resourcesGenerated} resources`,
            'resource'
        );

        // Reinforce territories
        for (const territory of currentPlayer.territories) {
            territory.army += 1;
        }

        // Move to next player
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.players[this.currentPlayerIndex].eliminated);

        // If back to player 0, increment turn
        if (this.currentPlayerIndex === 0) {
            this.turn++;
        }

        // AI turn
        const nextPlayer = this.players[this.currentPlayerIndex];
        if (nextPlayer.isAI && !this.gameOver) {
            this.ui.addLogMessage(`${nextPlayer.name}'s turn (AI)`, 'info');
            setTimeout(() => this.performAITurn(), 500);
        }

        this.selectedTerritory = null;
        this.updateUI();
        this.renderer.render(this.territories);
    }

    // Perform AI turn
    performAITurn() {
        const aiPlayer = this.players[this.currentPlayerIndex];
        aiPlayer.makeAIMove(this);

        // Auto-end AI turn after a short delay
        setTimeout(() => {
            if (!this.gameOver) {
                this.endTurn();
            }
        }, 1000);
    }

    // Check for victory condition
    checkVictory() {
        const activePlayers = this.players.filter(p => !p.eliminated);

        if (activePlayers.length === 1) {
            this.gameOver = true;
            const winner = activePlayers[0];
            this.ui.addLogMessage(
                `${winner.name} has conquered all of the UK!`,
                'victory'
            );
            setTimeout(() => this.ui.showVictory(winner), 1000);
        }
    }

    // Update all UI elements
    updateUI() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        this.ui.updateCurrentPlayer(currentPlayer);
        this.ui.updateTurnNumber(this.turn);
        this.ui.updatePlayersList(this.players, currentPlayer);

        if (this.selectedTerritory) {
            this.ui.updateTerritoryInfo(this.selectedTerritory);
        }
    }
}
