// Utility functions
const Utils = {
    // Get random number between min and max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Get random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Calculate distance between two points
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // Check if point is inside polygon
    pointInPolygon(x, y, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },

    // Calculate centroid of a polygon
    polygonCentroid(polygon) {
        let x = 0, y = 0;
        for (let i = 0; i < polygon.length; i++) {
            x += polygon[i][0];
            y += polygon[i][1];
        }
        return [x / polygon.length, y / polygon.length];
    },

    // Shuffle array
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // Darken a color
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    },

    // Lighten a color
    lightenColor(color, percent) {
        return this.darkenColor(color, -percent);
    }
};
