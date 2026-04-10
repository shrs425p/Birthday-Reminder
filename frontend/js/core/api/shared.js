window.API_BASE = '/api';

window.getAuthHeaders = function getAuthHeaders(isFormData = false) {
    let token = null;
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (adminUser && adminUser.token) token = adminUser.token;

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';
    return headers;
};

window.apiFetch = async function apiFetch(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();

    if ((res.status === 401 || res.status === 403) && typeof logout === 'function') {
        if (options && options.headers && options.headers.Authorization) {
            logout();
            if (typeof showToast === 'function') {
                showToast('Session expired. Please log in again.', 'error');
            }
        }
    }
    return data;
};

window.withLoading = async function withLoading(fn) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await fn();
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
};
