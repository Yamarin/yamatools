// Main module class
class YamaTools {
    static MODULE_ID = 'yamatools';

    static initialize() {
        console.log(`${this.MODULE_ID} | Initializing module`);
    }
}

// Module initialization hook
Hooks.once('init', () => {
    YamaTools.initialize();
});

// Ready hook
Hooks.once('ready', () => {
    console.log(`${YamaTools.MODULE_ID} | Module is ready`);
}); 