window.loginAPI = async function loginAPI(username, password, role) {
    return withLoading(() =>
        apiFetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        })
    );
};

window.changePasswordAPI = async function changePasswordAPI(username, currentPassword, newPassword) {
    return withLoading(() =>
        apiFetch(`${API_BASE}/password`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ username, currentPassword, newPassword })
        })
    );
};
