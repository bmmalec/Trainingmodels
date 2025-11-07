// Territory class
class Territory {
    constructor(id, polygon, center) {
        this.id = id;
        this.polygon = polygon; // Array of [x, y] coordinates
        this.center = center || Utils.polygonCentroid(polygon);
        this.owner = null; // Player object
        this.adjacent = []; // Array of adjacent territory IDs
        this.population = Utils.randomInt(50, 200);
        this.resources = Utils.randomInt(50, 150);
        this.army = 10;
        this.name = this.generateName();
    }

    // Generate a medieval-sounding name
    generateName() {
        const prefixes = [
            'North', 'South', 'East', 'West', 'New', 'Old',
            'Great', 'Little', 'Upper', 'Lower', 'High'
        ];
        const roots = [
            'ford', 'bridge', 'castle', 'haven', 'ton', 'burg',
            'dale', 'field', 'ham', 'shire', 'wood', 'moor',
            'port', 'mouth', 'chester', 'wick', 'thorpe', 'kirk'
        ];
        const suffixes = [
            'land', 'stead', 'worth', 'leigh', 'cester', 'minster'
        ];

        const usePrefix = Math.random() > 0.5;
        const useSuffix = Math.random() > 0.7;

        let name = '';

        if (usePrefix) {
            name += prefixes[Utils.randomInt(0, prefixes.length - 1)];
        }

        name += roots[Utils.randomInt(0, roots.length - 1)];

        if (useSuffix && !usePrefix) {
            name += suffixes[Utils.randomInt(0, suffixes.length - 1)];
        }

        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Calculate adjacency with another territory
    isAdjacentTo(otherTerritory) {
        // Check if polygons share any edges (simplified check using distance)
        for (let i = 0; i < this.polygon.length; i++) {
            for (let j = 0; j < otherTerritory.polygon.length; j++) {
                const dist = Utils.distance(
                    this.polygon[i][0], this.polygon[i][1],
                    otherTerritory.polygon[j][0], otherTerritory.polygon[j][1]
                );
                if (dist < 15) { // Threshold for adjacency
                    return true;
                }
            }
        }
        return false;
    }

    // Check if point is inside territory
    containsPoint(x, y) {
        return Utils.pointInPolygon(x, y, this.polygon);
    }

    // Generate resources each turn
    generateResources() {
        if (this.owner) {
            const generated = Math.floor(this.resources / 10);
            this.owner.resources += generated;
            return generated;
        }
        return 0;
    }

    // Fortify territory (increase army)
    fortify(amount) {
        this.army += amount;
    }

    // Get territory strength (for combat)
    getStrength() {
        return this.army * (1 + this.resources / 500);
    }
}
