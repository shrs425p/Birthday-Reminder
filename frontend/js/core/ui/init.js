document.addEventListener('DOMContentLoaded', () => {
    if (typeof initTheme === 'function') initTheme();
    if (typeof initAdvancedAnimations === 'function') initAdvancedAnimations();
    if (typeof initInteractiveBackground === 'function') initInteractiveBackground();
});
