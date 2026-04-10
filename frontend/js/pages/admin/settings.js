async function loadEmailTemplate() {
    const codeArea = document.getElementById('email-template-code');
    if (!codeArea) return;

    try {
        const data = await fetchSettingsAPI();

        if (data && data.email_user) {
            const emailInput = document.getElementById('smtp-email');
            if (emailInput) emailInput.value = data.email_user;
        }

        if (data && data.email_pass) {
            const passInput = document.getElementById('smtp-pass');
            if (passInput) passInput.value = data.email_pass;
        }

        if (data && data.auto_send_time) {
            const timeInput = document.getElementById('auto-send-time');
            if (timeInput) timeInput.value = data.auto_send_time;
        }

        if (data && data.email_template) {
            codeArea.value = data.email_template;
            updateEmailPreview();
        }
    } catch (e) {
        console.error('Failed to load email template', e);
    }
}

function updateEmailPreview() {
    const codeArea = document.getElementById('email-template-code');
    const previewIframe = document.getElementById('email-template-preview');
    if (!codeArea || !previewIframe) return;

    const htmlToPreview = codeArea.value;
    const doc = previewIframe.contentWindow.document;
    doc.open();
    doc.write(htmlToPreview);
    doc.close();
}

async function saveEmailTemplate() {
    const codeArea = document.getElementById('email-template-code');
    const btn = document.getElementById('save-template-btn');
    if (!codeArea || !btn) return;

    const newTemplate = codeArea.value.trim();
    if (!newTemplate) {
        alert('Template cannot be empty.');
        return;
    }

    setButtonLoading(btn, true);

    try {
        const data = await updateSettingAPI('email_template', newTemplate);
        if (data.success) {
            setButtonLoading(btn, false, true);
        } else {
            setButtonLoading(btn, false, false);
            alert('Failed to save: ' + data.message);
        }
    } catch (e) {
        setButtonLoading(btn, false, false);
        alert('Network Error');
    }
}

async function saveSmtpConfig() {
    const emailInput = document.getElementById('smtp-email');
    const passInput = document.getElementById('smtp-pass');
    const timeInput = document.getElementById('auto-send-time');
    const btn = document.getElementById('save-smtp-btn');

    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value.trim() : '';
    const time = timeInput ? timeInput.value : '';

    if (!email || !pass || !time) {
        showToast('Email, App Password, and Dispatch Time are required.', 'error');
        return;
    }

    if (btn) setButtonLoading(btn, true);

    try {
        const resUser = await updateSettingAPI('email_user', email);
        const resPass = pass !== '********' ? await updateSettingAPI('email_pass', pass) : { success: true };
        const resTime = await updateSettingAPI('auto_send_time', time);

        if (resUser.success && resPass.success && resTime.success) {
            if (btn) setButtonLoading(btn, false, true);
            showToast('SMTP Configuration saved successfully!', 'success');
        } else {
            if (btn) setButtonLoading(btn, false, false);
            showToast('Failed to save SMTP configuration.', 'error');
        }
    } catch (e) {
        if (btn) setButtonLoading(btn, false, false);
        showToast('Network Error while saving.', 'error');
    }
}

async function exportBirthdaysCSV() {
    try {
        const data = await fetchBirthdaysAPI();
        if (!data.success || !data.birthdays) {
            showToast('Failed to fetch data for export', 'error');
            return;
        }

        const headers = ['Name', 'DOB', 'Email', 'Note', 'Dept'];
        const rows = data.birthdays.map((b) => [
            `"${(b.name || '').replace(/"/g, '""')}"`,
            `="${b.dob || ''}"`,
            `"${(b.email || '').replace(/"/g, '""')}"`,
            `"${(b.note || '').replace(/"/g, '""')}"`,
            `"${(b.dept || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(',')].concat(rows.map((r) => r.join(','))).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'birthdays_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Data exported successfully', 'success');
    } catch {
        showToast('Network error during export', 'error');
    }
}

function downloadSampleCSV() {
    const headers = ['Name', 'DOB', 'Email', 'Note', 'Dept'];
    const sampleRows = [
        ['"John Doe"', '="2000-01-15"', '"john@example.com"', '"Likes chocolate cake"', '"Computer Engineering"'],
        ['"Jane Smith"', '="1999-11-20"', '"jane@example.com"', '""', '"Information Technology"']
    ];

    const csvContent = '\uFEFF' + [headers.join(',')].concat(sampleRows.map((r) => r.join(','))).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_birthdays.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Sample downloaded. Please keep the Email in the Email column.', 'info');
}

async function loadAdminStats() {
    try {
        const res = await fetch('/api/birthdays/stats', { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success && data.stats) {
            const s = data.stats;
            const el = (id, val) => {
                const node = document.getElementById(id);
                if (node) node.textContent = val;
            };
            el('stat-today', s.today ?? 0);
            el('stat-week', s.week ?? 0);
            el('stat-month', s.month ?? 0);
            el('stat-total', s.total ?? 0);
        }
    } catch (e) {
        console.error('Failed to load admin stats', e);
    }
}
