window.toggleTheme = function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.innerHTML = isDark ? '☀️' : '🌙';
    }
};

window.initTheme = function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark' || !savedTheme;

    if (shouldBeDark) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;

    themeBtn.innerHTML = shouldBeDark ? '☀️' : '🌙';
    themeBtn.style.background = 'none';
    themeBtn.style.border = 'none';
    themeBtn.style.cursor = 'pointer';
    themeBtn.style.fontSize = '18px';
    themeBtn.style.padding = '8px';
    themeBtn.style.marginLeft = '8px';
    themeBtn.title = 'Toggle Dark Mode';
    themeBtn.addEventListener('click', toggleTheme);
};
