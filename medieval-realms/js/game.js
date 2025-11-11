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
        // Mouse events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

        // Window resize for responsive canvas
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize(); // Initial sizing
    }

    // Handle canvas click
    handleCanvasClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        // Scale coordinates to match canvas resolution
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

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
        // Scale coordinates to match canvas resolution
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const hoveredTerritory = this.getTerritoryAt(x, y);

        if (hoveredTerritory) {
            this.canvas.style.cursor = 'pointer';
            this.renderer.render(this.territories, this.selectedTerritory);
            this.renderer.highlightHovered(hoveredTerritory);
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    // Handle touch start
    handleTouchStart(e) {
        e.preventDefault();
        this.touchStartTime = Date.now();
        this.touchMoved = false;
    }

    // Handle touch move
    handleTouchMove(e) {
        e.preventDefault();
        this.touchMoved = true;
    }

    // Handle touch end (treat as click if not moved)
    handleTouchEnd(e) {
        e.preventDefault();

        // Only treat as tap if finger didn't move and was quick
        if (!this.touchMoved && (Date.now() - this.touchStartTime) < 500) {
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();

            // Scale coordinates for canvas
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            const x = (touch.clientX - rect.left) * scaleX;
            const y = (touch.clientY - rect.top) * scaleY;

            // Create a synthetic event for handleCanvasClick
            const syntheticEvent = {
                clientX: rect.left + x / scaleX,
                clientY: rect.top + y / scaleY
            };

            this.handleCanvasClick(syntheticEvent);
        }
    }

    // Handle window resize
    handleResize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate appropriate canvas size
        const maxWidth = Math.min(containerWidth - 20, this.config.CANVAS_WIDTH);
        const maxHeight = Math.min(containerHeight - 20, this.config.CANVAS_HEIGHT);

        // Maintain aspect ratio
        const aspectRatio = this.config.CANVAS_WIDTH / this.config.CANVAS_HEIGHT;
        let newWidth = maxWidth;
        let newHeight = maxWidth / aspectRatio;

        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = maxHeight * aspectRatio;
        }

        // On mobile, use full width
        if (window.innerWidth <= 768) {
            newWidth = containerWidth - 10;
            newHeight = newWidth / aspectRatio;
        }

        // Update canvas display size (CSS)
        this.canvas.style.width = newWidth + 'px';
        this.canvas.style.height = newHeight + 'px';

        // Redraw if game is active
        if (this.territories.length > 0) {
            this.renderer.render(this.territories, this.selectedTerritory);
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
