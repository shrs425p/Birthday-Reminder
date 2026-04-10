// ============================================================
//  admin.js — Admin panel logic
//  Loaded only on admin.html
// ============================================================

let currentEditId = null;
let pendingDeleteId = null;

// ---------- Tab Switching ----------

function switchTab(tab) {
    const tabs = ['birthdays', 'requests', 'settings'];
    tabs.forEach(t => {
        const content = document.getElementById('tabcontent-' + t);
        const btn = document.getElementById('tab-' + t);
        if (content) {
            if (t === tab) {
                content.style.display = t === 'settings' ? 'flex' : 'block';
                content.style.flexDirection = 'column';
                content.style.gap = '24px';
            } else {
                content.style.display = 'none';
            }
        }
        if (btn) {
            btn.style.color = t === tab ? 'var(--primary)' : 'var(--gray-500)';
            btn.style.borderBottomColor = t === tab ? 'var(--primary)' : 'transparent';
        }
    });
}


async function fetchBirthdays() {
    const listEl = document.getElementById('birthdays-list');
    if (!listEl) return;

    // Inject skeleton rows for table
    listEl.innerHTML = `
        <div class="skeleton" style="height: 44px; border-radius: 0; margin-bottom: 1px;"></div>
        <div class="skeleton" style="height: 44px; border-radius: 0; margin-bottom: 1px;"></div>
        <div class="skeleton" style="height: 44px; border-radius: 0; margin-bottom: 1px;"></div>
    `;

    try {
        const data = await fetchBirthdaysAPI();

        if (!data.success) {
            listEl.innerHTML = `<div style="padding: 16px; color: var(--red);">Error: ${data.message}</div>`;
            return;
        }

        if (data.birthdays.length === 0) {
            listEl.innerHTML = getEmptyStateHTML(
                'No birthdays added',
                'There are no birthdays in the database yet.',
                '🎂'
            );
            return;
        }

        let html = `
            <div class="list-row-grid" style="padding: 12px 24px;
                        background: var(--gray-50); border-bottom: 1px solid var(--gray-100);
                        font-weight: 500; font-size: 13px; color: var(--gray-600); border-radius: var(--radius) var(--radius) 0 0; margin-bottom: 12px;">
                <span>Name</span>
                <span>Date</span>
                <span style="text-align: right;">Actions</span>
            </div>`;

        data.birthdays.forEach(b => {
            const safeName = b.name.replace(/'/g, "\\'");
            const safeNote = (b.note || '').replace(/'/g, "\\'");
            const safeEmail = (b.email || '').replace(/'/g, "\\'");
            const safeDept = (b.dept || '').replace(/'/g, "\\'");
            html += `
            <div class="swipe-container" id="swipe-${b.id}">
                <div class="swipe-background">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
                    </svg>
                </div>
                <!-- Added .list-item here so it gets the flat CSS and 3D tilt -->
                <div class="swipe-card list-item list-row-grid" onmousedown="startSwipe(event, ${b.id})" ontouchstart="startSwipe(event, ${b.id})">
                    <div>
                        <span style="font-weight: 500;">${b.name}</span>
                        ${b.dept ? `<span style="font-size: 11px; color: var(--gray-500); margin-left: 8px; background: var(--gray-100); padding: 2px 6px; border-radius: 4px;">${b.dept}</span>` : ''}
                    </div>
                    <span style="font-family: var(--font-mono); font-size: 13px;">${b.dob}</span>
                    <div style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="btn btn-secondary" style="padding: 6px 12px;"
                            onclick="prepareEdit(${b.id}, '${safeName}', '${b.dob}', '${safeNote}', '${safeEmail}', '${safeDept}')">Edit</button>
                        <button class="btn btn-danger" style="padding: 6px 12px;"
                            onclick="promptDeleteBirthday(${b.id})">Delete</button>
                    </div>
                </div>
            </div>`;
        });

        listEl.innerHTML = html;
    } catch {
        listEl.innerHTML = `<div style="padding: 16px; color: var(--red);">Network Error fetching data.</div>`;
    }
}

function isValidDateString(value) {
    if (!value) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value);
    return parsed instanceof Date && !isNaN(parsed.getTime());
}

async function addBirthday() {
    const name = document.getElementById('add-name').value.trim();
    const dob = document.getElementById('add-dob').value;
    const email = document.getElementById('add-email').value.trim();
    const note = document.getElementById('add-note').value.trim();
    const dept = document.getElementById('add-dept')?.value?.trim() || '';
    const isEditing = !!currentEditId;

    const submitBtn = document.getElementById('submit-birthday-btn');

    if (!name) {
        showToast('Please enter a student name.', 'error');
        return;
    }

    if (!isValidDateString(dob)) {
        showToast('Please enter a valid DOB (YYYY-MM-DD).', 'error');
        return;
    }

    // Trigger Liquid Loading Animation
    setButtonLoading(submitBtn, true);

    try {
        const data = isEditing
            ? await updateBirthdayAPI(currentEditId, name, dob, note, email, dept)
            : await addBirthdayAPI(name, dob, note, email, dept);

        if (data.success) {
            // Morph into Checkmark Success
            setButtonLoading(submitBtn, false, true);
            showToast(isEditing ? 'Birthday updated successfully' : 'New birthday saved', 'success');

            setTimeout(() => {
                cancelEdit();
                fetchBirthdays();
            }, 1000);

        } else {
            setButtonLoading(submitBtn, false, false);
            showToast('Error: ' + (data.message || data.error), 'error');
        }
    } catch {
        setButtonLoading(submitBtn, false, false);
        showToast('Network Error: Could not connect to API', 'error');
    }
}

function prepareEdit(id, name, dob, note, email, dept) {
    currentEditId = id;
    document.getElementById('add-name').value = name;
    document.getElementById('add-dob').value = dob;
    document.getElementById('add-email').value = email || '';
    document.getElementById('add-note').value = note || '';
    const deptEl = document.getElementById('add-dept');
    if (deptEl) deptEl.value = dept || '';
    document.getElementById('add-birthday-header').textContent = 'Edit Birthday';
    document.getElementById('submit-birthday-btn').textContent = 'Update Birthday';
    document.getElementById('cancel-edit-btn').style.display = 'inline-flex';
    document.getElementById('add-name').focus();
}

function cancelEdit() {
    currentEditId = null;
    document.getElementById('add-name').value = '';
    document.getElementById('add-dob').value = '';
    document.getElementById('add-email').value = '';
    document.getElementById('add-note').value = '';
    const deptEl = document.getElementById('add-dept');
    if (deptEl) deptEl.value = '';
    document.getElementById('add-birthday-header').textContent = 'Add New Birthday';
    document.getElementById('submit-birthday-btn').textContent = 'Save Birthday';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

// ---------- Delete Modal ----------

function promptDeleteBirthday(id) {
    pendingDeleteId = id;
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.style.display = 'flex';
        // Give the inner card a cute little pop bounce
        const card = modal.querySelector('.card');
        if (card) {
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            requestAnimationFrame(() => {
                card.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                card.style.transform = 'scale(1)';
                card.style.opacity = '1';
            });
        }
    }
}

function cancelDelete() {
    pendingDeleteId = null;
    const modal = document.getElementById('delete-modal');
    if (modal) {
        const card = modal.querySelector('.card');
        if (card) {
            card.style.transform = 'scale(0.9)';
            card.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 200);
        } else {
            modal.style.display = 'none';
        }
    }
}

async function confirmDeleteBirthday() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    cancelDelete();

    // Animate removal first if card is visible
    const deleteBtn = document.querySelector(`button[onclick="promptDeleteBirthday(${id})"]`);
    if (deleteBtn) {
        const card = deleteBtn.closest('.swipe-container');
        if (card) {
            card.classList.add('deleting');
            // Wait for 400ms CSS animation to finish
            await new Promise(r => setTimeout(r, 400));
        }
    }

    try {
        const data = await deleteBirthdayAPI(id);
        if (data.success) {
            showToast('Birthday deleted', 'info');
            fetchBirthdays();
        } else {
            showToast('Delete failed: ' + data.error, 'error');
        }
    } catch {
        showToast('Network Error while deleting.', 'error');
    }
}

// Requests handlers moved to /js/pages/admin/requests.js

// ---------- Search Filter ----------

function filterAdminBirthdays(query) {
    const rows = document.querySelectorAll('#birthdays-list > div:not(:first-child)');
    rows.forEach(row => {
        const name = row.querySelector('span')?.textContent?.toLowerCase() || '';
        row.style.display = name.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// ---------- Swipe to Delete ----------
function startSwipe(e, id) {
    // Only allow swipe on touch or left mouse button, avoiding buttons
    if (e.target.tagName.toLowerCase() === 'button' || (e.type === 'mousedown' && e.button !== 0)) return;

    const card = e.currentTarget;
    const container = card.parentElement;
    const background = container.querySelector('.swipe-background');

    let startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let currentX = startX;

    // Disable transition during drag
    card.style.transition = 'none';

    function onMove(moveEvent) {
        currentX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
        let diff = currentX - startX;

        // Only allow swiping left
        if (diff > 0) diff = 0;

        card.style.transform = `translateX(${diff}px)`;
        background.style.opacity = Math.min(Math.abs(diff) / 100, 1);
    }

    function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);

        card.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        let diff = currentX - startX;
        // If swiped left enough (>100px), trigger delete
        if (diff < -100) {
            card.style.transform = `translateX(-100%)`;
            setTimeout(() => {
                promptDeleteBirthday(id);
                // Listen for cancellation to snap it back
                const checkModal = setInterval(() => {
                    if (document.getElementById('delete-modal').style.display === 'none') {
                        card.style.transform = `translateX(0)`;
                        background.style.opacity = 0;
                        clearInterval(checkModal);
                    }
                }, 100);
            }, 200);
        } else {
            // Snap back
            card.style.transform = `translateX(0)`;
            background.style.opacity = 0;
        }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
}

// ---------- Bulk Actions (Excel Upload & Mail Wishes) ----------

async function uploadExcel() {
    const fileInput = document.getElementById('excel-file');
    const statusEl = document.getElementById('upload-status');
    const file = fileInput.files[0];
    const btn = document.querySelector('button[onclick="uploadExcel()"]');

    if (!file) {
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--red)';
        statusEl.textContent = 'Please select a .xlsx file first.';
        return;
    }

    if (btn) setButtonLoading(btn, true);
    statusEl.style.display = 'block';
    statusEl.style.color = 'var(--blue)';
    statusEl.textContent = 'Uploading and processing...';

    try {
        const data = await uploadExcelAPI(file);
        if (data.success) {
            if (btn) setButtonLoading(btn, false, true);
            statusEl.style.color = 'var(--green)';
            let message = data.message || 'Import completed successfully.';
            if (data.details && data.details.errors && data.details.errors.length) {
                message += '\nErrors:';
                data.details.errors.forEach(err => {
                    message += `\nRow ${err.row}: ${err.reason}`;
                });
                statusEl.style.color = 'var(--orange)';
            }
            statusEl.textContent = message;
            fileInput.value = ''; // clear input
            fetchBirthdays();     // refresh table
        } else {
            if (btn) setButtonLoading(btn, false, false);
            statusEl.style.color = 'var(--red)';
            statusEl.textContent = 'Upload failed: ' + (data.message || 'Unknown error');
        }
    } catch {
        if (btn) setButtonLoading(btn, false, false);
        statusEl.style.color = 'var(--red)';
        statusEl.textContent = 'Network Error: Could not reach API.';
    }

    // Auto-hide status after a few seconds if successful
    setTimeout(() => {
        if (statusEl.style.color === 'var(--black)' || statusEl.style.color === 'rgb(255, 255, 255)' || statusEl.style.color === 'white') statusEl.style.display = 'none';
    }, 4000);
}

async function sendBirthdayWishes() {
    const statusEl = document.getElementById('wish-status');
    const btn = document.querySelector('button[onclick="sendBirthdayWishes()"]');

    if (btn) setButtonLoading(btn, true);
    statusEl.style.display = 'block';
    statusEl.style.color = 'var(--blue)';
    statusEl.textContent = 'Sending emails...';

    try {
        const data = await sendBirthdayWishesAPI();
        if (data.success) {
            if (btn) setButtonLoading(btn, false, true);
            statusEl.style.color = 'var(--black)';
            statusEl.textContent = data.message;


        } else {
            if (btn) setButtonLoading(btn, false, false);
            statusEl.style.color = 'var(--red)';
            statusEl.textContent = 'Email failed: ' + (data.message || 'Unknown error. Check .env config.');
        }
    } catch {
        if (btn) setButtonLoading(btn, false, false);
        statusEl.style.color = 'var(--red)';
        statusEl.textContent = 'Network Error: Could not reach API.';
    }
}

// Settings/stat handlers moved to /js/pages/admin/settings.js

document.addEventListener('DOMContentLoaded', () => {
    if (typeof fetchBirthdays === 'function') fetchBirthdays();
    if (typeof fetchRequests === 'function') fetchRequests();
    if (typeof loadEmailTemplate === 'function') loadEmailTemplate();
    if (typeof loadAdminStats === 'function') loadAdminStats();
});
