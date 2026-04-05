// ============================================================
//  ui-utils.js — Reusable UI Components
// ============================================================

/**
 * Shows a toast notification on the screen.
 * @param {string} message - The message to display
 * @param {'success'|'error'|'info'} type - The visual style
 * @param {number} duration - How long it stays on screen (ms)
 */
function showToast(message, type = 'info', duration = 3000) {
    // Check if container exists, create if not
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Add icon based on type
    let icon = '';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '⚠';
    else icon = 'ℹ';

    toast.innerHTML = `<span style="font-size: 16px;">${icon}</span> <span>${message}</span>`;

    // Append to container
    container.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, duration);
}

/**
 * Generates HTML for a beautiful empty state
 * @param {string} title - The main heading
 * @param {string} description - The subtext
 * @param {string} icon - An emoji or symbol
 * @returns {string} HTML string for the empty state
 */
function getEmptyStateHTML(title, description, icon = '📁') {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
        </div>
    `;
}

// ============================================================
//  Dark Mode Toggle Logic
// ============================================================

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.innerHTML = isDark ? '☀️' : '🌙';
    }
}

function initTheme() {
    // Check saved preference or default to dark
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark' || !savedTheme;

    if (shouldBeDark) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Set initial icon if button exists
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.innerHTML = shouldBeDark ? '☀️' : '🌙';

        // Add minimal styling to make it fit anywhere in the nav
        themeBtn.style.background = 'none';
        themeBtn.style.border = 'none';
        themeBtn.style.cursor = 'pointer';
        themeBtn.style.fontSize = '18px';
        themeBtn.style.padding = '8px';
        themeBtn.style.marginLeft = '8px';
        themeBtn.title = 'Toggle Dark Mode';

        // Attach click listener
        themeBtn.addEventListener('click', () => {
            toggleTheme();
        });
    }
}

// ============================================================
//  Advanced Micro-Interactions
// ============================================================

/**
 * Initializes Spotlight and Magnetic effects
 */
function initAdvancedAnimations() {
    let isTicking = false;

    document.addEventListener('mousemove', (e) => {
        // e.target.closest finds the deepest hovered element, so hovering a list-item won't tilt the parent card
        const target = e.target.closest('.premium-birthday-card, .card, .list-item, .empty-state');
        if (!target) return;

        if (!isTicking) {
            window.requestAnimationFrame(() => {
                const rect = target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                target.style.setProperty('--mouse-x', `${x}px`);
                target.style.setProperty('--mouse-y', `${y}px`);

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Dynamic Intensity: Large cards tilt less to prevent clipping/jitter, small cards tilt more
                let intensity = 8;
                if (target.classList.contains('premium-birthday-card')) intensity = 22;
                else if (target.classList.contains('empty-state')) intensity = 12;
                else if (target.classList.contains('list-item')) intensity = 6;
                else {
                    // Huge cards (like Admin panels) scale down their tilt angle
                    const sizeFactor = Math.max(rect.width, rect.height);
                    intensity = Math.max(2.5, 2000 / sizeFactor);
                }

                const rotateX = ((y - centerY) / centerY) * -intensity;
                const rotateY = ((x - centerX) / centerX) * intensity;

                const scale = target.classList.contains('list-item') ? 1.005 : 1.015;

                target.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
                target.style.transition = 'transform 0.1s ease-out';
                target.style.zIndex = '10'; // Pop above siblings

                isTicking = false;
            });
            isTicking = true;
        }
    });

    // Reset transform on mouse leave
    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('.premium-birthday-card, .card, .list-item, .empty-state');
        if (target && !target.contains(e.relatedTarget)) {
            target.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            target.style.transition = 'transform 0.5s ease';
            target.style.zIndex = '';
        }
    });

    // 2. Magnetic Buttons (apply to nav links and FABs)
    function addMagneticEffect(selector) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            el.classList.add('magnetic-btn');

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const h = rect.width / 2;
                const v = rect.height / 2;

                // Calculate distance from center
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - v;

                // Pull effect (max 10px)
                const pullX = (x / h) * 10;
                const pullY = (y / v) * 10;

                el.style.transform = `translate(${pullX}px, ${pullY}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = `translate(0px, 0px)`;
            });
        });
    }

    // Apply magnetic to main nav and specific buttons
    setTimeout(() => {
        addMagneticEffect('.nav-link');
        addMagneticEffect('.fab');
        addMagneticEffect('.btn-primary');
    }, 500); // Wait for DOM injection
}


/**
 * Creates a Scratch-off effect on a given element
 */
function createScratchOff(containerId, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.style.position = 'relative';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.cursor = 'crosshair';
    canvas.style.zIndex = '5';
    container.appendChild(canvas);

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with silver/gold premium texture
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const isDark = document.body.classList.contains('dark-theme');
    if (isDark) {
        grad.addColorStop(0, '#444');
        grad.addColorStop(0.5, '#666');
        grad.addColorStop(1, '#444');
    } else {
        grad.addColorStop(0, '#ccc');
        grad.addColorStop(0.5, '#eee');
        grad.addColorStop(1, '#ccc');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise/shimmer
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    ctx.globalCompositeOperation = 'destination-out';

    let isDrawing = false;
    let scratchedPercent = 0;

    function scratch(e) {
        if (!isDrawing) return;
        const b = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - b.left;
        const y = (e.clientY || e.touches[0].clientY) - b.top;

        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        checkProgress();
    }

    function checkProgress() {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 0) count++;
        }
        scratchedPercent = (count / (canvas.width * canvas.height)) * 100;
        if (scratchedPercent > 40) {
            canvas.style.transition = 'opacity 0.5s ease';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.remove();
                if (callback) callback();
            }, 500);
        }
    }

    canvas.addEventListener('mousedown', () => isDrawing = true);
    canvas.addEventListener('touchstart', () => isDrawing = true);
    window.addEventListener('mouseup', () => isDrawing = false);
    window.addEventListener('touchend', () => isDrawing = false);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchmove', scratch);
}

/**
 * Global API Loading Bar Simulator
 */
function showLoadingBar() {
    let bar = document.getElementById('global-loading-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'global-loading-bar';
        bar.className = 'top-loading-bar';
        document.body.appendChild(bar);
    }

    // Force reflow and start animation
    void bar.offsetWidth;
    bar.classList.add('active');
}

function hideLoadingBar() {
    const bar = document.getElementById('global-loading-bar');
    if (bar) {
        bar.classList.remove('active');
        // Let it finish fading out before resetting transform
        setTimeout(() => {
            bar.style.transform = 'scaleX(0)';
        }, 300);
    }
}





/**
 * Interactive Dot Grid Distortion Background
 */
function initInteractiveBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'interactive-bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100VW';
    canvas.style.height = '100VH';
    canvas.style.zIndex = '-10'; // Behind everything
    canvas.style.pointerEvents = 'none';

    // Remove the CSS dotted background to let the canvas take over
    document.body.style.backgroundImage = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;

    // Grid settings
    const spacing = 24;
    const dotSize = 1.6;
    let dots = [];

    // Mouse tracking
    let mouse = { x: -1000, y: -1000 };
    const repulseRadius = 120;
    const repulseForce = 8;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initGrid();
    }

    function initGrid() {
        dots = [];
        for (let x = 0; x <= width; x += spacing) {
            for (let y = 0; y <= height; y += spacing) {
                dots.push({
                    ox: x, oy: y, // Original positions
                    x: x, y: y,   // Current positions
                    vx: 0, vy: 0  // Velocity
                });
            }
        }
    }

    function animate() {
        // ✅ FIX: Skip physics when tab is hidden — saves CPU/battery
        if (document.hidden) {
            requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        const isDark = document.body.classList.contains('dark-theme');
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';

        for (let i = 0; i < dots.length; i++) {
            const p = dots[i];

            // Physics: spring back to original
            const dx = p.ox - p.x;
            const dy = p.oy - p.y;

            // Mouse repulsion
            const mdx = mouse.x - p.x;
            const mdy = mouse.y - p.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (dist < repulseRadius) {
                const force = (repulseRadius - dist) / repulseRadius;
                p.vx -= (mdx / dist) * force * repulseForce;
                p.vy -= (mdy / dist) * force * repulseForce;
            }

            // Spring force
            p.vx += dx * 0.05;
            p.vy += dy * 0.05;

            // Friction
            p.vx *= 0.7;
            p.vy *= 0.7;

            p.x += p.vx;
            p.y += p.vy;

            // Draw
            ctx.beginPath();
            ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    window.addEventListener('resize', resize);

    // ✅ FIX: Resume animation when user returns to the tab
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) requestAnimationFrame(animate);
    });

    resize();
    animate();
}


/**
 * Visual helper for Morphing / Liquid buttons during async
 */
function setButtonLoading(btn, isLoading, isSuccess = false) {
    if (!btn) return;

    if (isLoading) {
        if (!btn.dataset.originalText) {
            btn.dataset.originalText = btn.innerHTML;
        }
        btn.classList.add('btn-loading');
        btn.classList.remove('btn-success');
    } else {
        btn.classList.remove('btn-loading');

        if (isSuccess) {
            btn.classList.add('btn-success');
            setTimeout(() => {
                btn.classList.remove('btn-success');
                btn.innerHTML = btn.dataset.originalText;
            }, 1500);
        } else {
            btn.innerHTML = btn.dataset.originalText;
        }
    }
}

/**
 * Enables smooth Swipe-to-Delete for a container holding a `.swipe-card`.
 * Swiping past threshold triggers the deletion callback.
 */
function initSwipeToDelete(container, onDelete) {
    const card = container.querySelector('.swipe-card');
    if (!card) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let isDeleting = false;

    card.addEventListener('pointerdown', (e) => {
        if (isDeleting) return;
        isDragging = true;
        startX = e.clientX;
        card.style.transition = 'none'; // precise tracking

        // Show swipe-background underneath
        const bg = container.querySelector('.swipe-background');
        if (bg) bg.style.opacity = '1';

        // capture pointer so drag works outside elements
        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
        if (!isDragging || isDeleting) return;

        const deltaX = e.clientX - startX;

        // Only allow swiping left
        if (deltaX < 0) {
            currentX = deltaX;
            // Add some resistance
            const maxSwing = -150;
            let actualX = currentX;

            if (currentX < maxSwing) {
                // Diminishing returns after maxSwing
                actualX = maxSwing + (currentX - maxSwing) * 0.2;
            }

            card.style.transform = `translateX(${actualX}px)`;
        }
    });

    const releaseDrag = () => {
        if (!isDragging || isDeleting) return;
        isDragging = false;

        card.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        if (currentX < -80) { // Threshold for delete
            // Trigger delete
            isDeleting = true;
            card.style.transform = `translateX(-120%)`; // shoot off screen

            setTimeout(() => {
                if (onDelete) onDelete();
            }, 250);
        } else {
            // Snap back
            currentX = 0;
            card.style.transform = `translateX(0px)`;

            const bg = container.querySelector('.swipe-background');
            if (bg) {
                setTimeout(() => {
                    if (currentX === 0 && bg) bg.style.opacity = '0';
                }, 200);
            }
        }
    };

    card.addEventListener('pointerup', releaseDrag);
    card.addEventListener('pointercancel', releaseDrag);
}

// Auto-initialize theme and animations on script load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAdvancedAnimations();
    initInteractiveBackground();
});

// ============================================================
//  Global Watermark
// ============================================================

