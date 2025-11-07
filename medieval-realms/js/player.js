// Player class
class Player {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.resources = CONFIG.STARTING_RESOURCES;
        this.territories = [];
        this.isAI = id > 0; // Player 0 is human, others are AI
        this.eliminated = false;
    }

    // Add territory to player's control
    addTerritory(territory) {
        if (!this.territories.includes(territory)) {
            this.territories.push(territory);
            territory.owner = this;
        }
    }

    // Remove territory from player's control
    removeTerritory(territory) {
        const index = this.territories.indexOf(territory);
        if (index > -1) {
            this.territories.splice(index, 1);
            if (this.territories.length === 0) {
                this.eliminated = true;
            }
        }
    }

    // Get total army size
    getTotalArmy() {
        return this.territories.reduce((sum, t) => sum + t.army, 0);
    }

    // Get total population
    getTotalPopulation() {
        return this.territories.reduce((sum, t) => sum + t.population, 0);
    }

    // Generate resources from all territories
    collectResources() {
        let total = 0;
        for (const territory of this.territories) {
            total += territory.generateResources();
        }
        return total;
    }

    // AI decision making
    makeAIMove(game) {
        if (this.eliminated || !this.isAI) return;

        // Find territories that can attack
        const attackablePairs = [];

        for (const myTerritory of this.territories) {
            for (const adjacentId of myTerritory.adjacent) {
                const enemyTerritory = game.territories[adjacentId];
                if (enemyTerritory.owner !== this) {
                    attackablePairs.push({
                        from: myTerritory,
                        to: enemyTerritory,
                        strengthRatio: myTerritory.getStrength() / enemyTerritory.getStrength()
                    });
                }
            }
        }

        // Attack if we have a strong advantage
        if (attackablePairs.length > 0) {
            // Sort by strength ratio and pick the best option
            attackablePairs.sort((a, b) => b.strengthRatio - a.strengthRatio);

            // Attack if we have at least 1.5x strength advantage
            if (attackablePairs[0].strengthRatio > 1.5) {
                game.attack(attackablePairs[0].from, attackablePairs[0].to);
                return;
            }
        }

        // Otherwise, fortify a random border territory
        const borderTerritories = this.territories.filter(t => {
            return t.adjacent.some(adjId => {
                const adj = game.territories[adjId];
                return adj.owner !== this;
            });
        });

        if (borderTerritories.length > 0 && this.resources >= 20) {
            const territory = borderTerritories[Utils.randomInt(0, borderTerritories.length - 1)];
            const amount = Math.min(5, Math.floor(this.resources / 20));
            territory.fortify(amount);
            this.resources -= amount * 4;
        }
    }
}
