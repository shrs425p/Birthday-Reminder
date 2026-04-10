window.fetchRequestsAPI = async function fetchRequestsAPI() {
    return withLoading(() => apiFetch(`${API_BASE}/requests`, { headers: getAuthHeaders() }));
};

window.resolveRequestAPI = async function resolveRequestAPI(id, status) {
    return withLoading(() =>
        apiFetch(`${API_BASE}/requests/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        })
    );
};

window.submitRequestAPI = async function submitRequestAPI(student_name, correct_dob, email, note, dept) {
    return withLoading(() =>
        apiFetch(`${API_BASE}/requests`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ student_name, correct_dob, email, note, dept })
        })
    );
};
