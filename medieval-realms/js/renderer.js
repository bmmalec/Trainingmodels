// Rendering engine
class Renderer {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.hoveredTerritory = null;
        this.selectedTerritory = null;

        // Set canvas size
        canvas.width = config.CANVAS_WIDTH;
        canvas.height = config.CANVAS_HEIGHT;
    }

    // Render the entire game state
    render(territories, selectedTerritory = null) {
        this.selectedTerritory = selectedTerritory;
        this.clear();
        this.drawTerritories(territories);
        this.drawBorders(territories);
        this.highlightSelected(selectedTerritory);
    }

    // Clear canvas
    clear() {
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw all territories
    drawTerritories(territories) {
        for (const territory of territories) {
            this.drawTerritory(territory);
        }
    }

    // Draw a single territory
    drawTerritory(territory) {
        if (territory.polygon.length === 0) return;

        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(territory.polygon[0][0], territory.polygon[0][1]);

        for (let i = 1; i < territory.polygon.length; i++) {
            ctx.lineTo(territory.polygon[i][0], territory.polygon[i][1]);
        }

        ctx.closePath();

        // Fill with owner's color or neutral
        if (territory.owner) {
            ctx.fillStyle = territory.owner.color;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = '#666';
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // Draw territory center with army indicator
        // Always show army count for all territories
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw background circle with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.beginPath();
        ctx.arc(territory.center[0], territory.center[1], 18, 0, Math.PI * 2);
        ctx.fillStyle = territory.owner ? Utils.darkenColor(territory.owner.color, 30) : '#333';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw army count with larger, bolder font
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        const armyText = territory.army.toString();
        ctx.strokeText(armyText, territory.center[0], territory.center[1]);
        ctx.fillText(armyText, territory.center[0], territory.center[1]);

        // Draw territory name below army count
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        const nameY = territory.center[1] + 26;
        ctx.strokeText(territory.name, territory.center[0], nameY);
        ctx.fillText(territory.name, territory.center[0], nameY);
    }

    // Draw territory borders
    drawBorders(territories) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = this.config.BORDER_WIDTH;

        for (const territory of territories) {
            if (territory.polygon.length === 0) continue;

            ctx.beginPath();
            ctx.moveTo(territory.polygon[0][0], territory.polygon[0][1]);

            for (let i = 1; i < territory.polygon.length; i++) {
                ctx.lineTo(territory.polygon[i][0], territory.polygon[i][1]);
            }

            ctx.closePath();
            ctx.stroke();
        }
    }

    // Highlight selected territory
    highlightSelected(territory) {
        if (!territory || territory.polygon.length === 0) return;

        const ctx = this.ctx;
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = this.config.SELECTED_BORDER_WIDTH;
        ctx.setLineDash([10, 5]);

        ctx.beginPath();
        ctx.moveTo(territory.polygon[0][0], territory.polygon[0][1]);

        for (let i = 1; i < territory.polygon.length; i++) {
            ctx.lineTo(territory.polygon[i][0], territory.polygon[i][1]);
        }

        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Highlight hovered territory
    highlightHovered(territory) {
        if (!territory || territory.polygon.length === 0) return;

        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(territory.polygon[0][0], territory.polygon[0][1]);

        for (let i = 1; i < territory.polygon.length; i++) {
            ctx.lineTo(territory.polygon[i][0], territory.polygon[i][1]);
        }

        ctx.closePath();

        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Draw attack animation
    drawAttackAnimation(fromTerritory, toTerritory, callback) {
        const start = fromTerritory.center;
        const end = toTerritory.center;
        let progress = 0;
        const duration = 500; // ms
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);

            // Redraw territories
            this.clear();
            this.drawTerritories([fromTerritory, toTerritory]);

            // Draw arrow
            const x = start[0] + (end[0] - start[0]) * progress;
            const y = start[1] + (end[1] - start[1]) * progress;

            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(start[0], start[1]);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };

        animate();
    }
}
