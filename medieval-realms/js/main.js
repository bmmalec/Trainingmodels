// Main entry point
let game;

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Medieval Realms...');

    // Create game instance
    game = new Game(CONFIG);

    // Start new game
    game.newGame();

    console.log('Medieval Realms loaded successfully!');
});

// Handle window resize
window.addEventListener('resize', () => {
    if (game) {
        game.renderer.render(game.territories, game.selectedTerritory);
    }
});
