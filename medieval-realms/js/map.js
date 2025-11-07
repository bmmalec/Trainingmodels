// Map generation and management
class GameMap {
    constructor(config) {
        this.config = config;
        this.territories = [];
    }

    // Generate the map with territories
    generate() {
        console.log('Generating map...');

        // Generate seed points for Voronoi diagram
        const points = VoronoiGenerator.generatePoints(
            this.config.NUM_TERRITORIES,
            this.config.MAP_BOUNDS,
            this.config.UK_REGIONS
        );

        // Generate Voronoi diagram
        const voronoi = new VoronoiGenerator(
            this.config.CANVAS_WIDTH,
            this.config.CANVAS_HEIGHT,
            points
        );

        const cells = voronoi.generate();

        // Create territories from cells
        this.territories = cells
            .filter(cell => cell.length > 3) // Filter out tiny territories
            .map((polygon, i) => {
                const center = points[i] || Utils.polygonCentroid(polygon);
                return new Territory(i, polygon, center);
            });

        // Calculate adjacencies
        this.calculateAdjacencies();

        console.log(`Generated ${this.territories.length} territories`);
        return this.territories;
    }

    // Calculate which territories are adjacent
    calculateAdjacencies() {
        for (let i = 0; i < this.territories.length; i++) {
            for (let j = i + 1; j < this.territories.length; j++) {
                if (this.territories[i].isAdjacentTo(this.territories[j])) {
                    this.territories[i].adjacent.push(j);
                    this.territories[j].adjacent.push(i);
                }
            }
        }
    }

    // Get territory at point
    getTerritoryAt(x, y) {
        for (const territory of this.territories) {
            if (territory.containsPoint(x, y)) {
                return territory;
            }
        }
        return null;
    }

    // Distribute territories among players
    distributeToPlayers(players) {
        // Shuffle territories for random distribution
        const shuffled = Utils.shuffle(this.territories);
        const territoriesPerPlayer = Math.floor(shuffled.length / players.length);

        let index = 0;
        for (const player of players) {
            const count = Math.min(territoriesPerPlayer, shuffled.length - index);
            for (let i = 0; i < count; i++) {
                player.addTerritory(shuffled[index]);
                index++;
            }
        }

        // Distribute any remaining territories
        while (index < shuffled.length) {
            const player = players[index % players.length];
            player.addTerritory(shuffled[index]);
            index++;
        }
    }
}
