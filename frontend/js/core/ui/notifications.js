window.showToast = function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '⚠';

    toast.innerHTML = `<span style="font-size: 16px;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, duration);
};

window.getEmptyStateHTML = function getEmptyStateHTML(title, description, icon = '📁') {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
        </div>
    `;
};
