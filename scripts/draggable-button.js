// Module ID constant
const MODULE_ID = 'yamatools';

// Make DraggableButton globally available
window.DraggableButton = class DraggableButton {
    constructor() {
        this.button = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.position = {
            x: 20,
            y: 20
        };
        this.locked = false;
    }

    async loadPosition() {
        // Load position from Foundry settings
        if (typeof game !== 'undefined' && game.settings) {
            const pos = await game.settings.get('yamatools', 'buttonPosition');
            if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
                this.position = pos;
            }
        }
    }

    async savePosition() {
        // Save position to Foundry settings
        if (typeof game !== 'undefined' && game.settings) {
            await game.settings.set('yamatools', 'buttonPosition', this.position);
        }
    }

    async loadLockState() {
        if (typeof game !== 'undefined' && game.settings) {
            this.locked = await game.settings.get('yamatools', 'buttonLocked');
        }
    }

    async saveLockState() {
        if (typeof game !== 'undefined' && game.settings) {
            await game.settings.set('yamatools', 'buttonLocked', this.locked);
        }
    }

    async create() {
        await this.loadPosition();
        await this.loadLockState();
        // Create button element
        this.button = document.createElement('div');
        this.button.className = 'yamatools-draggable-button';
        // Use built-in Font Awesome dice icon
        this.button.innerHTML = '<i class="fas fa-dice-d20"></i>';
        // Add lock icon overlay if locked
        this.renderLockIcon();
        this.button.style.left = `${this.position.x}px`;
        this.button.style.top = `${this.position.y}px`;

        // Add event listeners
        this.button.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.button.addEventListener('contextmenu', this.onContextMenu.bind(this));

        // Add button to the document
        document.body.appendChild(this.button);
        console.log(`${MODULE_ID} | Draggable button created`);
    }

    renderLockIcon() {
        // Remove existing lock icon if any
        const oldLock = this.button.querySelector('.yamatools-lock-icon');
        if (oldLock) oldLock.remove();
        if (this.locked) {
            // Add a small lock icon in the bottom-right corner
            const lock = document.createElement('span');
            lock.className = 'yamatools-lock-icon';
            lock.innerHTML = '<i class="fas fa-lock"></i>';
            lock.style.position = 'absolute';
            lock.style.right = '2px';
            lock.style.bottom = '2px';
            lock.style.fontSize = '6px';
            lock.style.color = '#e0dfd7';
            lock.style.pointerEvents = 'none';
            this.button.appendChild(lock);
        }
    }

    async onContextMenu(event) {
        event.preventDefault(); // Prevent context menu
        this.locked = !this.locked;
        await this.saveLockState();
        this.renderLockIcon();
        ui.notifications?.info(`Button is now ${this.locked ? 'locked' : 'unlocked'}.`);
    }

    onMouseDown(event) {
        if (event.button !== 0) return; // Only handle left mouse button
        if (this.locked) return; // Prevent dragging if locked
        this.isDragging = true;
        const rect = this.button.getBoundingClientRect();
        this.offsetX = event.clientX - rect.left;
        this.offsetY = event.clientY - rect.top;
        
        // Prevent text selection while dragging
        event.preventDefault();
        console.log(`${MODULE_ID} | Button drag started`);
    }

    onMouseMove(event) {
        if (!this.isDragging) return;

        const x = event.clientX - this.offsetX;
        const y = event.clientY - this.offsetY;

        // Update position
        this.position.x = x;
        this.position.y = y;
        this.button.style.left = `${x}px`;
        this.button.style.top = `${y}px`;
    }

    async onMouseUp() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        await this.savePosition();
        console.log(`${MODULE_ID} | Button drag ended at position:`, this.position);
    }

    destroy() {
        if (this.button) {
            this.button.remove();
            this.button = null;
        }
        console.log(`${MODULE_ID} | Draggable button destroyed`);
    }
} 