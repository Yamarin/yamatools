// Module ID constant - must match the one in draggable-button.js
const MODULE_ID = 'yamatools';

// Main module class
class YamaTools {
    static MODULE_ID = MODULE_ID;
    static draggableButton = null;
    static menuButtons = [];

    static initialize() {
        console.log(`${MODULE_ID} | Initializing module`);
        // Register a client setting for button position
        game.settings.register(MODULE_ID, 'buttonPosition', {
            name: 'Button Position',
            scope: 'client',
            config: false,
            type: Object,
            default: { x: 20, y: 20 }
        });
        // Register a client setting for button lock state
        game.settings.register(MODULE_ID, 'buttonLocked', {
            name: 'Button Locked',
            scope: 'client',
            config: false,
            type: Boolean,
            default: false
        });
        // Ensure draggable-button.js is loaded
        if (typeof DraggableButton === 'undefined') {
            console.error(`${MODULE_ID} | DraggableButton not found during initialization`);
        } else {
            console.log(`${MODULE_ID} | DraggableButton found during initialization`);
        }
    }

    static async createDraggableButton() {
        try {
            if (!this.draggableButton) {
                if (typeof DraggableButton === 'undefined') {
                    throw new Error('DraggableButton class not found');
                }
                console.log(`${MODULE_ID} | Creating draggable button...`);
                this.draggableButton = new DraggableButton();
                this.draggableButton.create();
                console.log(`${MODULE_ID} | Draggable button created successfully`);
            }
        } catch (error) {
            console.error(`${MODULE_ID} | Error creating draggable button:`, error);
        }
    }

    static destroyDraggableButton() {
        if (this.draggableButton) {
            this.draggableButton.destroy();
            this.draggableButton = null;
        }
    }

    // API for other modules to register menu buttons
    static registerMenuButton({icon, label, onClick}) {
        this.menuButtons.push({icon, label, onClick});
        // If the draggableButton exists, re-render the menu if open
        if (this.draggableButton && this.draggableButton.renderMenu) {
            this.draggableButton.renderMenu();
        }
    }
}

// Make YamaTools globally available and expose registerMenuButton
window.YamaTools = YamaTools;
window.YamaTools.registerMenuButton = YamaTools.registerMenuButton.bind(YamaTools);

// Module initialization hook
Hooks.once('init', () => {
    YamaTools.initialize();
});

// Ready hook - using async to ensure proper loading
Hooks.once('ready', async () => {
    console.log(`${MODULE_ID} | Module is ready`);
    // Try to create the button immediately
    await YamaTools.createDraggableButton();
    
    // If that fails, try again after a short delay
    if (!YamaTools.draggableButton) {
        console.log(`${MODULE_ID} | Retrying button creation after delay...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        await YamaTools.createDraggableButton();
    }
});

// Cleanup hook
Hooks.once('destroy', () => {
    YamaTools.destroyDraggableButton();
}); 