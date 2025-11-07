// Game configuration
const CONFIG = {
    // Canvas settings
    CANVAS_WIDTH: 900,
    CANVAS_HEIGHT: 700,

    // Map settings - UK boundaries (approximation)
    MAP_BOUNDS: {
        minX: 100,
        maxX: 800,
        minY: 50,
        maxY: 650
    },

    // Territory settings
    NUM_TERRITORIES: 35, // Similar to UK counties
    MIN_TERRITORY_SIZE: 15,

    // Player settings
    NUM_PLAYERS: 4,
    PLAYER_COLORS: [
        '#FF4136', // Red
        '#0074D9', // Blue
        '#2ECC40', // Green
        '#FF851B', // Orange
        '#B10DC9', // Purple
        '#FFD700', // Gold
        '#39CCCC', // Teal
        '#F012BE'  // Magenta
    ],
    PLAYER_NAMES: [
        'House Lancaster',
        'House York',
        'House Tudor',
        'House Stuart',
        'House Plantagenet',
        'House Wessex',
        'House Mercia',
        'House Northumbria'
    ],

    // Game settings
    STARTING_RESOURCES: 100,
    RESOURCE_PER_TERRITORY: 10,
    ATTACK_SUCCESS_BASE: 0.6,

    // Rendering settings
    BORDER_WIDTH: 2,
    HOVER_OPACITY: 0.8,
    SELECTED_BORDER_WIDTH: 4,

    // UK regional seed points for more realistic territory placement
    UK_REGIONS: [
        // Scotland
        { x: 0.3, y: 0.15, weight: 5 },
        { x: 0.35, y: 0.2, weight: 4 },
        { x: 0.4, y: 0.25, weight: 3 },
        // Northern England
        { x: 0.35, y: 0.35, weight: 4 },
        { x: 0.45, y: 0.38, weight: 3 },
        { x: 0.4, y: 0.42, weight: 3 },
        // Midlands
        { x: 0.35, y: 0.5, weight: 4 },
        { x: 0.45, y: 0.52, weight: 4 },
        { x: 0.4, y: 0.55, weight: 3 },
        // Wales
        { x: 0.25, y: 0.55, weight: 3 },
        { x: 0.2, y: 0.6, weight: 3 },
        // Eastern England
        { x: 0.55, y: 0.5, weight: 3 },
        { x: 0.6, y: 0.55, weight: 3 },
        { x: 0.58, y: 0.6, weight: 3 },
        // Southern England
        { x: 0.4, y: 0.7, weight: 4 },
        { x: 0.48, y: 0.72, weight: 4 },
        { x: 0.35, y: 0.75, weight: 3 },
        { x: 0.5, y: 0.75, weight: 3 },
        // Southwest
        { x: 0.25, y: 0.75, weight: 3 },
        { x: 0.28, y: 0.82, weight: 2 }
    ]
};
