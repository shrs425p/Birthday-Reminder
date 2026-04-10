async function fetchRequests() {
    const listEl = document.getElementById('requests-list');
    if (!listEl) return;

    listEl.innerHTML = `
        <div class="skeleton" style="height: 44px; border-radius: 0; margin-bottom: 1px;"></div>
        <div class="skeleton" style="height: 44px; border-radius: 0; margin-bottom: 1px;"></div>
    `;

    try {
        const data = await fetchRequestsAPI();

        if (!data.success) {
            listEl.innerHTML = `<div style="padding: 16px; color: var(--red);">Error: ${data.message}</div>`;
            return;
        }

        if (data.requests.length === 0) {
            listEl.innerHTML = getEmptyStateHTML(
                'No pending requests',
                'All student correction tickets have been resolved.',
                '✅'
            );
            return;
        }

        let html = `
            <div class="list-row-grid" style="padding: 12px 24px;
                        background: var(--gray-50); border-bottom: 1px solid var(--gray-100);
                        font-weight: 500; font-size: 13px; color: var(--gray-600); border-radius: var(--radius) var(--radius) 0 0; margin-bottom: 12px;">
                <span>Student</span>
                <span>Requested DOB</span>
                <span style="text-align: right;">Actions</span>
            </div>`;

        data.requests.forEach((r) => {
            html += `
            <div class="list-item list-row-grid" style="align-items: flex-start;">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="font-weight: 500;">${r.student_name}</span>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        ${r.email ? `<span style="font-size: 12px; color: var(--gray-600);">${r.email}</span>` : ''}
                        ${r.dept ? `<span style="font-size: 10px; color: var(--gray-400); background: var(--gray-50); padding: 1px 4px; border-radius: 4px; border: 1px solid var(--gray-100);">${r.dept}</span>` : ''}
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-family: var(--font-mono); font-size: 13px;">${r.correct_dob}</span>
                    ${r.note ? `<span style="font-size: 12px; color: var(--gray-500); font-style: italic;">"${r.note}"</span>` : ''}
                </div>
                <div style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-primary" style="padding: 6px 12px; background: var(--green); border-color: var(--green);"
                        onclick="resolveRequest(${r.id}, 'approved')">Approve</button>
                    <button class="btn btn-danger" style="padding: 6px 12px;"
                        onclick="resolveRequest(${r.id}, 'rejected')">Reject</button>
                </div>
            </div>`;
        });

        listEl.innerHTML = html;
    } catch {
        listEl.innerHTML = `<div style="padding: 16px; color: var(--red);">Network Error.</div>`;
    }
}

async function resolveRequest(id, status) {
    try {
        const data = await resolveRequestAPI(id, status);
        if (data.success) {
            showToast(`Request ${status} successfully`, 'success');
            fetchRequests();
            fetchBirthdays();
        } else {
            showToast('Failed to resolve: ' + (data.message || data.error), 'error');
        }
    } catch {
        showToast('Network Error while resolving request.', 'error');
    }
}
