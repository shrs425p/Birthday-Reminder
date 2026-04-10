window.initAdvancedAnimations = function initAdvancedAnimations() {
    let isTicking = false;

    document.addEventListener('mousemove', (e) => {
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
                let intensity = 8;

                if (target.classList.contains('premium-birthday-card')) intensity = 22;
                else if (target.classList.contains('empty-state')) intensity = 12;
                else if (target.classList.contains('list-item')) intensity = 6;
                else intensity = Math.max(2.5, 2000 / Math.max(rect.width, rect.height));

                const rotateX = ((y - centerY) / centerY) * -intensity;
                const rotateY = ((x - centerX) / centerX) * intensity;
                const scale = target.classList.contains('list-item') ? 1.005 : 1.015;

                target.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
                target.style.transition = 'transform 0.1s ease-out';
                target.style.zIndex = '10';
                isTicking = false;
            });
            isTicking = true;
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('.premium-birthday-card, .card, .list-item, .empty-state');
        if (target && !target.contains(e.relatedTarget)) {
            target.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            target.style.transition = 'transform 0.5s ease';
            target.style.zIndex = '';
        }
    });

    function addMagneticEffect(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
            el.classList.add('magnetic-btn');

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const halfW = rect.width / 2;
                const halfH = rect.height / 2;
                const x = e.clientX - rect.left - halfW;
                const y = e.clientY - rect.top - halfH;
                el.style.transform = `translate(${(x / halfW) * 10}px, ${(y / halfH) * 10}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    setTimeout(() => {
        addMagneticEffect('.nav-link');
        addMagneticEffect('.fab');
        addMagneticEffect('.btn-primary');
    }, 500);
};

window.createScratchOff = function createScratchOff(containerId, callback) {
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

    for (let i = 0; i < 100; i += 1) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }

    ctx.globalCompositeOperation = 'destination-out';
    let isDrawing = false;

    const scratch = (e) => {
        if (!isDrawing) return;
        const b = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - b.left;
        const y = (e.clientY || e.touches[0].clientY) - b.top;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let j = 0; j < data.length; j += 4) {
            if (data[j + 3] === 0) count += 1;
        }
        const scratchedPercent = (count / (canvas.width * canvas.height)) * 100;
        if (scratchedPercent > 40) {
            canvas.style.transition = 'opacity 0.5s ease';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.remove();
                if (callback) callback();
            }, 500);
        }
    };

    canvas.addEventListener('mousedown', () => {
        isDrawing = true;
    });
    canvas.addEventListener('touchstart', () => {
        isDrawing = true;
    });
    window.addEventListener('mouseup', () => {
        isDrawing = false;
    });
    window.addEventListener('touchend', () => {
        isDrawing = false;
    });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchmove', scratch);
};
