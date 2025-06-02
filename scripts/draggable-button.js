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
        this.justClosedMenu = false;
        this.wasDragging = false;
        this.menuJustClosedByDocument = false;
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
        this.button.style.position = 'fixed';

        // Create menu container
        this.menuContainer = document.createElement('div');
        this.menuContainer.className = 'yamatools-menu-container';
        this.menuContainer.style.display = 'none';
        this.menuContainer.style.position = 'fixed';
        this.menuContainer.style.zIndex = 1001;
        document.body.appendChild(this.menuContainer);

        // Add event listeners
        this.button.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.button.addEventListener('contextmenu', this.onContextMenu.bind(this));
        this.button.addEventListener('click', this.onLeftClick.bind(this));
        document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this));

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
        this.wasDragging = false;
        const rect = this.button.getBoundingClientRect();
        this.offsetX = event.clientX - rect.left;
        this.offsetY = event.clientY - rect.top;
        event.preventDefault();
        console.log(`${MODULE_ID} | Button drag started`);
    }

    onMouseMove(event) {
        if (!this.isDragging) return;
        this.wasDragging = true;
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
        if (this.wasDragging) {
            await this.savePosition();
            console.log(`${MODULE_ID} | Button drag ended at position:`, this.position);
        }
    }

    onLeftClick(event) {
        if (event.button !== 0) return; // Only LMB
        if (!this.locked) return; // Only allow menu when locked
        if (this.menuJustClosedByDocument) {
            this.menuJustClosedByDocument = false;
            return;
        }
        if (this.menuContainer.style.display === 'none') {
            this.openMenu();
            console.log(`${MODULE_ID} | Yamatool button clicked while locked (menu shown)`);
        } else {
            this.closeMenu();
            console.log(`${MODULE_ID} | Yamatool button clicked while locked (menu hidden)`);
        }
    }

    openMenu() {
        this.renderMenu();
        // Position menu above the yamatool button
        const rect = this.button.getBoundingClientRect();
        this.menuContainer.style.left = `${rect.left}px`;
        this.menuContainer.style.top = `${rect.top - (YamaTools.menuButtons.length * 40)}px`;
        this.menuContainer.style.display = 'flex';
        this.menuContainer.style.flexDirection = 'column-reverse';
        this.menuContainer.style.gap = '4px';
    }

    closeMenu() {
        this.menuContainer.style.display = 'none';
    }

    renderMenu() {
        // Clear previous
        this.menuContainer.innerHTML = '';
        // Render each menu button
        YamaTools.menuButtons.forEach((btn, idx) => {
            const el = document.createElement('div');
            el.className = 'yamatools-draggable-button';
            el.style.position = 'relative';
            el.style.margin = '0 auto';
            el.innerHTML = btn.icon + (btn.label ? `<span style="margin-left:6px;font-size:12px;vertical-align:middle;">${btn.label}</span>` : '');
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeMenu();
                btn.onClick?.();
            });
            this.menuContainer.appendChild(el);
        });
    }

    onDocumentMouseDown(event) {
        // Close menu if clicking outside
        if (this.menuContainer.style.display !== 'none' && !this.menuContainer.contains(event.target) && event.target !== this.button) {
            this.closeMenu();
            this.menuJustClosedByDocument = true;
        }
    }

    destroy() {
        if (this.button) {
            this.button.remove();
            this.button = null;
        }
        console.log(`${MODULE_ID} | Draggable button destroyed`);
    }
} 