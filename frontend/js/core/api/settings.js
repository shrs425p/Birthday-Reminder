window.fetchSettingsAPI = async function fetchSettingsAPI() {
    return withLoading(() => apiFetch(`${API_BASE}/settings`, { headers: getAuthHeaders() }));
};

window.updateSettingAPI = async function updateSettingAPI(key, value) {
    return withLoading(() =>
        apiFetch(`${API_BASE}/settings/${key}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ value })
        })
    );
};
