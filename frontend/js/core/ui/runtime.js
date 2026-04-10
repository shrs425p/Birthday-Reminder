window.showLoadingBar = function showLoadingBar() {
    let bar = document.getElementById('global-loading-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'global-loading-bar';
        bar.className = 'top-loading-bar';
        document.body.appendChild(bar);
    }
    void bar.offsetWidth;
    bar.classList.add('active');
};

window.hideLoadingBar = function hideLoadingBar() {
    const bar = document.getElementById('global-loading-bar');
    if (!bar) return;

    bar.classList.remove('active');
    setTimeout(() => {
        bar.style.transform = 'scaleX(0)';
    }, 300);
};

window.initInteractiveBackground = function initInteractiveBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'interactive-bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100VW';
    canvas.style.height = '100VH';
    canvas.style.zIndex = '-10';
    canvas.style.pointerEvents = 'none';

    document.body.style.backgroundImage = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width;
    let height;
    const spacing = 24;
    const dotSize = 1.6;
    let dots = [];
    const mouse = { x: -1000, y: -1000 };
    const repulseRadius = 120;
    const repulseForce = 8;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        dots = [];

        for (let x = 0; x <= width; x += spacing) {
            for (let y = 0; y <= height; y += spacing) {
                dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
            }
        }
    }

    function animate() {
        if (document.hidden) {
            requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, width, height);
        const isDark = document.body.classList.contains('dark-theme');
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';

        for (let i = 0; i < dots.length; i += 1) {
            const p = dots[i];
            const dx = p.ox - p.x;
            const dy = p.oy - p.y;
            const mdx = mouse.x - p.x;
            const mdy = mouse.y - p.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (dist < repulseRadius) {
                const force = (repulseRadius - dist) / repulseRadius;
                p.vx -= (mdx / dist) * force * repulseForce;
                p.vy -= (mdy / dist) * force * repulseForce;
            }

            p.vx += dx * 0.05;
            p.vy += dy * 0.05;
            p.vx *= 0.7;
            p.vy *= 0.7;
            p.x += p.vx;
            p.y += p.vy;

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
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) requestAnimationFrame(animate);
    });

    resize();
    animate();
};

window.setButtonLoading = function setButtonLoading(btn, isLoading, isSuccess = false) {
    if (!btn) return;

    if (isLoading) {
        if (!btn.dataset.originalText) {
            btn.dataset.originalText = btn.innerHTML;
        }
        btn.classList.add('btn-loading');
        btn.classList.remove('btn-success');
        return;
    }

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
};

window.initSwipeToDelete = function initSwipeToDelete(container, onDelete) {
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
        card.style.transition = 'none';

        const bg = container.querySelector('.swipe-background');
        if (bg) bg.style.opacity = '1';
        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
        if (!isDragging || isDeleting) return;
        const deltaX = e.clientX - startX;
        if (deltaX >= 0) return;

        currentX = deltaX;
        const maxSwing = -150;
        let actualX = currentX;
        if (currentX < maxSwing) {
            actualX = maxSwing + (currentX - maxSwing) * 0.2;
        }
        card.style.transform = `translateX(${actualX}px)`;
    });

    const releaseDrag = () => {
        if (!isDragging || isDeleting) return;
        isDragging = false;
        card.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        if (currentX < -80) {
            isDeleting = true;
            card.style.transform = 'translateX(-120%)';
            setTimeout(() => {
                if (onDelete) onDelete();
            }, 250);
        } else {
            currentX = 0;
            card.style.transform = 'translateX(0px)';
            const bg = container.querySelector('.swipe-background');
            if (bg) {
                setTimeout(() => {
                    if (currentX === 0) bg.style.opacity = '0';
                }, 200);
            }
        }
    };

    card.addEventListener('pointerup', releaseDrag);
    card.addEventListener('pointercancel', releaseDrag);
};
