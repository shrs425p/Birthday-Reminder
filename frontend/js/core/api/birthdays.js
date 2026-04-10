window.fetchBirthdaysAPI = async function fetchBirthdaysAPI() {
    return withLoading(() => apiFetch(`${API_BASE}/birthdays`, { headers: getAuthHeaders() }));
};

window.fetchTodaysBirthdaysAPI = async function fetchTodaysBirthdaysAPI() {
    return withLoading(() => apiFetch(`${API_BASE}/birthdays/today`));
};

window.fetchUpcomingBirthdaysAPI = async function fetchUpcomingBirthdaysAPI() {
    return withLoading(() => apiFetch(`${API_BASE}/birthdays/upcoming`));
};

window.addBirthdayAPI = async function addBirthdayAPI(name, dob, note, email, dept) {
    return withLoading(() =>
        apiFetch(`${API_BASE}/birthdays`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, dob, note, email, dept })
        })
    );
};

window.updateBirthdayAPI = async function updateBirthdayAPI(id, name, dob, note, email, dept) {
    return withLoading(() =>
        apiFetch(`${API_BASE}/birthdays/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, dob, note, email, dept })
        })
    );
};

window.deleteBirthdayAPI = async function deleteBirthdayAPI(id) {
    return withLoading(() =>
        apiFetch(`${API_BASE}/birthdays/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
    );
};

window.uploadExcelAPI = async function uploadExcelAPI(file) {
    return withLoading(() => {
        const formData = new FormData();
        formData.append('file', file);

        return apiFetch(`${API_BASE}/birthdays/upload`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: formData
        });
    });
};

window.sendBirthdayWishesAPI = async function sendBirthdayWishesAPI() {
    return withLoading(() =>
        apiFetch(`${API_BASE}/birthdays/wish`, {
            method: 'POST',
            headers: getAuthHeaders()
        })
    );
};

window.sendTodayWishesAPI = async function sendTodayWishesAPI() {
    return withLoading(() =>
        apiFetch(`${API_BASE}/send-wishes`, {
            method: 'POST',
            headers: getAuthHeaders()
        })
    );
};
