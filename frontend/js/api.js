// ============================================================
//  api.js — Centralized API layer
//  All fetch calls go through here. Pages import these funcs.
// ============================================================

const API_BASE = '/api';

// ---------- Helpers ----------

function getAuthHeaders(isFormData = false) {
    let token = null;
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (adminUser && adminUser.token) token = adminUser.token;

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    return headers;
}

async function apiFetch(url, options) {
    const res = await fetch(url, options);
    const data = await res.json();
    if ((res.status === 401 || res.status === 403) && typeof logout === 'function') {
        if (options && options.headers && options.headers['Authorization']) {
            logout();
            if (typeof showToast === 'function') {
                showToast('Session expired. Please log in again.', 'error');
            }
        }
    }
    return data;
}


// ---------- Auth ----------

async function loginAPI(username, password, role) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function changePasswordAPI(username, currentPassword, newPassword) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/password`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ username, currentPassword, newPassword })
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

// ---------- Birthdays ----------

async function fetchBirthdaysAPI() {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/birthdays`, { headers: getAuthHeaders() });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function fetchTodaysBirthdaysAPI() {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/birthdays/today`);
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function fetchUpcomingBirthdaysAPI() {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/birthdays/upcoming`);
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function addBirthdayAPI(name, dob, note, email, dept) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/birthdays`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, dob, note, email, dept })
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function updateBirthdayAPI(id, name, dob, note, email, dept) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/birthdays/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, dob, note, email, dept })
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function deleteBirthdayAPI(id) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/birthdays/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function uploadExcelAPI(file) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        const formData = new FormData();
        formData.append('file', file);

        return await apiFetch(`${API_BASE}/birthdays/upload`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: formData
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function sendBirthdayWishesAPI() {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/birthdays/wish`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function sendTodayWishesAPI() {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/send-wishes`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

// Individual-send via admin SMTP removed — frontend now opens user's email client via mailto

// ---------- Requests ----------

async function fetchRequestsAPI() {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/requests`, { headers: getAuthHeaders() });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function resolveRequestAPI(id, status) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/requests/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function submitRequestAPI(student_name, correct_dob, email, note, dept) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/requests`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ student_name, correct_dob, email, note, dept })
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

// ---------- Settings ----------

async function fetchSettingsAPI() {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/settings`, { headers: getAuthHeaders() });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}

async function updateSettingAPI(key, value) {
    if (window.showLoadingBar) showLoadingBar();
    try {
        return await apiFetch(`${API_BASE}/settings/${key}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ value })
        });
    } finally {
        if (window.hideLoadingBar) hideLoadingBar();
    }
}
