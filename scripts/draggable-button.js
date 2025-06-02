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
    }

    create() {
        // Create button element
        this.button = document.createElement('div');
        this.button.className = 'yamatools-draggable-button';
        // Use built-in Font Awesome dice icon
        this.button.innerHTML = '<i class="fas fa-dice-d20"></i>';
        this.button.style.left = `${this.position.x}px`;
        this.button.style.top = `${this.position.y}px`;

        // Add event listeners
        this.button.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Add button to the document
        document.body.appendChild(this.button);
        console.log(`${MODULE_ID} | Draggable button created`);
    }

    onMouseDown(event) {
        if (event.button !== 0) return; // Only handle left mouse button
        
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

    onMouseUp() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
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