// ============================================================
//  student.js — Student panel logic
//  Loaded only on student.html
// ============================================================

let studentBirthdaysList = [];

async function fetchStudentBirthdays() {
    const listEl = document.getElementById('student-birthdays-list');
    if (!listEl) return;

    // Inject skeleton rows for table
    listEl.innerHTML = `
        <div class="skeleton skeleton-card" style="margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-card" style="margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-card" style="margin-bottom: 12px;"></div>
    `;

    try {
        const data = await fetchBirthdaysAPI();

        if (!data.success) {
            listEl.innerHTML = `<div style="padding: 16px; color: var(--red);">Error: ${data.message}</div>`;
            return;
        }

        studentBirthdaysList = data.birthdays;
        renderStudentBirthdays(studentBirthdaysList);
    } catch {
        listEl.innerHTML = `<div style="padding: 16px; color: var(--red);">Network Error fetching data.</div>`;
    }
}

function renderStudentBirthdays(birthdays) {
    const listEl = document.getElementById('student-birthdays-list');
    if (!listEl) return;

    if (birthdays.length === 0) {
        listEl.innerHTML = getEmptyStateHTML(
            'No birthdays found',
            'There are no birthdays matching your search.',
            '🔍'
        );
        return;
    }

    const today = new Date();
    let html = `
    <div class="list-row-grid" style="padding: 12px 24px;
                background: var(--gray-50); border-bottom: 1px solid var(--gray-100);
                font-weight: 500; font-size: 13px; color: var(--gray-600); border-radius: var(--radius) var(--radius) 0 0; margin-bottom: 12px;">
        <span>Name</span>
        <span>Date</span>
        <span style="text-align:right;">Overview</span>
    </div>`;

    birthdays.forEach(b => {
        const dobDate = new Date(b.dob);
        const deptName = (b.dept || b.department || b.Dept || '').trim();
        let age = today.getFullYear() - dobDate.getFullYear();
        if (
            today.getMonth() < dobDate.getMonth() ||
            (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate())
        ) {
            age--;
        }
        const turnAge = age + 1;

        html += `
        <div class="list-item list-row-grid">
            <div>
                <span style="font-weight: 500;">${b.name}</span>
                ${deptName ? `<span style="font-size: 11px; color: var(--gray-500); margin-left: 8px; background: var(--gray-100); padding: 2px 6px; border-radius: 4px;">${deptName}</span>` : ''}
            </div>
            <span style="font-family: var(--font-mono); font-size: 13px;">${b.dob}</span>
            <div style="display:flex; justify-content:flex-end; font-size: 13px; color: var(--gray-600);">
                Turning <span class="font-mono" style="margin-left: 4px; font-weight:bold; color: var(--green);">${turnAge}</span>
            </div>
        </div>`;
    });

    listEl.innerHTML = html;


}

function filterStudentBirthdays() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = studentBirthdaysList.filter(b => b.name.toLowerCase().includes(query));
    renderStudentBirthdays(filtered);
}

async function submitRequest(e) {
    const student_name = document.getElementById('request-name').value.trim();
    const correct_dob = document.getElementById('request-dob').value;
    const email = document.getElementById('request-email').value.trim();
    const note = document.getElementById('request-note').value.trim();
    const dept = document.getElementById('request-dept')?.value?.trim() || '';

    if (!student_name || !correct_dob) {
        showToast('Please fill in both Name and Date of Birth.', 'error');
        return;
    }

    // Liquid button styling
    const submitBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    try {
        const data = await submitRequestAPI(student_name, correct_dob, email, note, dept);

        if (data.success) {
            setButtonLoading(submitBtn, false, true);

            showToast('Request submitted to Admin for review!', 'success');
            document.getElementById('request-name').value = '';
            document.getElementById('request-dob').value = '';
            document.getElementById('request-email').value = '';
            document.getElementById('request-note').value = '';
            const deptEl = document.getElementById('request-dept');
            if (deptEl) deptEl.value = '';

        } else {
            setButtonLoading(submitBtn, false, false);
            showToast('Error: ' + data.message, 'error');
        }
    } catch {
        setButtonLoading(submitBtn, false, false);
        showToast('Network Error: Could not connect to API.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', fetchStudentBirthdays);
