// UI Controller
class UIController {
    constructor(game) {
        this.game = game;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            playerName: document.getElementById('player-name'),
            turnNumber: document.getElementById('turn-number'),
            playersList: document.getElementById('players-list'),
            territoryInfo: document.getElementById('territory-info'),
            gameLog: document.getElementById('game-log'),
            endTurnBtn: document.getElementById('end-turn-btn'),
            newGameBtn: document.getElementById('new-game-btn')
        };
    }

    attachEventListeners() {
        this.elements.endTurnBtn.addEventListener('click', () => {
            this.game.endTurn();
        });

        this.elements.newGameBtn.addEventListener('click', () => {
            if (confirm('Start a new game?')) {
                this.game.newGame();
            }
        });
    }

    // Update current player display
    updateCurrentPlayer(player) {
        this.elements.playerName.textContent = player.name;
        this.elements.playerName.style.color = player.color;
    }

    // Update turn number
    updateTurnNumber(turn) {
        this.elements.turnNumber.textContent = turn;
    }

    // Update players list
    updatePlayersList(players, currentPlayer) {
        this.elements.playersList.innerHTML = '';

        for (const player of players) {
            if (player.eliminated) continue;

            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.style.borderLeftColor = player.color;

            if (player === currentPlayer) {
                playerItem.classList.add('active');
            }

            playerItem.innerHTML = `
                <div>
                    <div style="color: ${player.color}; font-weight: bold;">${player.name}</div>
                    <div style="font-size: 0.85em; color: #999;">
                        ${player.territories.length} territories
                    </div>
                </div>
                <div>
                    <div style="color: #ffd700;">${player.resources}💰</div>
                </div>
            `;

            this.elements.playersList.appendChild(playerItem);
        }
    }

    // Update territory info panel
    updateTerritoryInfo(territory) {
        if (!territory) {
            this.elements.territoryInfo.innerHTML = '<p>Click a territory to view details</p>';
            return;
        }

        const ownerName = territory.owner ? territory.owner.name : 'Neutral';
        const ownerColor = territory.owner ? territory.owner.color : '#999';

        this.elements.territoryInfo.innerHTML = `
            <h4 style="color: ${ownerColor}; margin-bottom: 0.5rem;">${territory.name}</h4>
            <div class="territory-stat">
                <span class="label">Owner:</span>
                <span class="value" style="color: ${ownerColor};">${ownerName}</span>
            </div>
            <div class="territory-stat">
                <span class="label">Army:</span>
                <span class="value">${territory.army}</span>
            </div>
            <div class="territory-stat">
                <span class="label">Population:</span>
                <span class="value">${territory.population}</span>
            </div>
            <div class="territory-stat">
                <span class="label">Resources:</span>
                <span class="value">${territory.resources}</span>
            </div>
            <div class="territory-stat">
                <span class="label">Neighbors:</span>
                <span class="value">${territory.adjacent.length}</span>
            </div>
        `;
    }

    // Add message to game log
    addLogMessage(message, type = 'info') {
        const p = document.createElement('p');
        p.textContent = message;

        if (type === 'combat') {
            p.style.borderLeftColor = '#ff4136';
        } else if (type === 'resource') {
            p.style.borderLeftColor = '#ffd700';
        } else if (type === 'victory') {
            p.style.borderLeftColor = '#2ecc40';
        }

        this.elements.gameLog.insertBefore(p, this.elements.gameLog.firstChild);

        // Keep only last 20 messages
        while (this.elements.gameLog.children.length > 20) {
            this.elements.gameLog.removeChild(this.elements.gameLog.lastChild);
        }
    }

    // Show victory screen
    showVictory(winner) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        overlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
                border: 5px solid ${winner.color};
                border-radius: 10px;
                padding: 3rem;
                text-align: center;
                box-shadow: 0 0 50px ${winner.color};
            ">
                <h1 style="color: ${winner.color}; font-size: 3rem; margin-bottom: 1rem;">
                    🏆 VICTORY! 🏆
                </h1>
                <h2 style="color: #fff; font-size: 2rem; margin-bottom: 2rem;">
                    ${winner.name} has conquered the UK!
                </h2>
                <button class="btn" style="font-size: 1.2rem; padding: 1rem 2rem;">
                    New Game
                </button>
            </div>
        `;

        overlay.querySelector('.btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            this.game.newGame();
        });

        document.body.appendChild(overlay);
    }
}
