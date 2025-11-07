// Simplified Voronoi diagram generator for territory creation
class VoronoiGenerator {
    constructor(width, height, points) {
        this.width = width;
        this.height = height;
        this.points = points;
    }

    // Generate Voronoi cells using pixel sampling
    generate() {
        const cells = this.points.map(() => []);
        const resolution = 5; // Sample every 5 pixels for performance

        // Assign pixels to nearest point
        for (let y = 0; y < this.height; y += resolution) {
            for (let x = 0; x < this.width; x += resolution) {
                let minDist = Infinity;
                let nearestPoint = 0;

                for (let i = 0; i < this.points.length; i++) {
                    const dist = Utils.distance(x, y, this.points[i].x, this.points[i].y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestPoint = i;
                    }
                }

                cells[nearestPoint].push([x, y]);
            }
        }

        // Convert pixels to polygons (boundary tracing)
        return cells.map((cell, i) => this.cellToPolygon(cell, this.points[i]));
    }

    // Convert cell pixels to polygon boundary
    cellToPolygon(pixels, center) {
        if (pixels.length === 0) return [];

        // Find boundary pixels
        const boundary = this.findBoundary(pixels);

        // Sort boundary points by angle from center
        const sorted = boundary.sort((a, b) => {
            const angleA = Math.atan2(a[1] - center.y, a[0] - center.x);
            const angleB = Math.atan2(b[1] - center.y, b[0] - center.x);
            return angleA - angleB;
        });

        // Simplify polygon (reduce number of points)
        return this.simplifyPolygon(sorted, 10);
    }

    // Find boundary pixels of a cell
    findBoundary(pixels) {
        const pixelSet = new Set(pixels.map(p => `${p[0]},${p[1]}`));
        const boundary = [];

        for (const pixel of pixels) {
            const [x, y] = pixel;
            // Check if any neighbor is not in the cell
            const neighbors = [
                [x - 5, y], [x + 5, y], [x, y - 5], [x, y + 5]
            ];

            for (const [nx, ny] of neighbors) {
                if (!pixelSet.has(`${nx},${ny}`)) {
                    boundary.push(pixel);
                    break;
                }
            }
        }

        return boundary;
    }

    // Simplify polygon using sampling
    simplifyPolygon(points, sampleEvery) {
        if (points.length <= sampleEvery) return points;

        const simplified = [];
        for (let i = 0; i < points.length; i += sampleEvery) {
            simplified.push(points[i]);
        }

        return simplified;
    }

    // Generate random points with clustering around UK regions
    static generatePoints(num, bounds, regions) {
        const points = [];
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;

        for (let i = 0; i < num; i++) {
            let x, y;

            // 70% chance to place near a region, 30% random
            if (Math.random() < 0.7 && regions && regions.length > 0) {
                const region = regions[Utils.randomInt(0, regions.length - 1)];
                const spread = 50;
                x = bounds.minX + region.x * width + Utils.random(-spread, spread);
                y = bounds.minY + region.y * height + Utils.random(-spread, spread);
            } else {
                x = Utils.random(bounds.minX, bounds.maxX);
                y = Utils.random(bounds.minY, bounds.maxY);
            }

            // Ensure point is within bounds
            x = Math.max(bounds.minX + 20, Math.min(bounds.maxX - 20, x));
            y = Math.max(bounds.minY + 20, Math.min(bounds.maxY - 20, y));

            points.push({ x, y, id: i });
        }

        return points;
    }
}
