// ============================================================
//  auth.js — Login / Logout / Session management
//  Loaded on admin.html and student.html
// ============================================================

async function adminLogin() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const errEl = document.getElementById('admin-error');
    const btn = document.querySelector('#login-view button[type="submit"]');

    if (btn) setButtonLoading(btn, true);

    try {
        const data = await loginAPI(user, pass, 'admin');
        if (data.success) {
            if (btn) setButtonLoading(btn, false, true);
            localStorage.setItem('adminUser', JSON.stringify({ username: user, role: 'admin', token: data.token }));
            showPanel();
            errEl.style.display = 'none';
            if (typeof fetchBirthdays === 'function') fetchBirthdays();
            if (typeof fetchRequests === 'function') fetchRequests();
        } else {
            if (btn) setButtonLoading(btn, false, false);
            errEl.textContent = 'Invalid credentials.';
            errEl.style.display = 'block';
        }
    } catch {
        if (btn) setButtonLoading(btn, false, false);
        errEl.textContent = 'Server Error: Could not connect to API.';
        errEl.style.display = 'block';
    }
}



function logout() {
    const path = window.location.pathname;
    if (path.includes('admin')) {
        localStorage.removeItem('adminUser');
    }

    document.getElementById('login-view').style.display = 'flex';
    document.getElementById('panel-view').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';

    const cpBtn = document.getElementById('changePassBtn');
    if (cpBtn) cpBtn.style.display = 'none';
}

function showPanel() {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('panel-view').style.display = 'flex';
    document.getElementById('logoutBtn').style.display = 'inline-flex';

    const cpBtn = document.getElementById('changePassBtn');
    if (cpBtn) cpBtn.style.display = 'inline-flex';
}

function checkSessionOnLoad() {
    const path = window.location.pathname;
    let userKey = '';

    if (path.includes('admin')) {
        userKey = 'adminUser';
    }

    if (!userKey) return;

    const userStr = localStorage.getItem(userKey);
    if (!userStr) return;

    try {
        const userObj = JSON.parse(userStr);
        const loginView = document.getElementById('login-view');
        const panelView = document.getElementById('panel-view');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginView && panelView && logoutBtn) {
            showPanel();
            if (userObj.role === 'admin' && path.includes('admin')) {
                if (typeof fetchBirthdays === 'function') fetchBirthdays();
                if (typeof fetchRequests === 'function') fetchRequests();
            }
        }
    } catch { /* invalid session data */ }
}

// ---------- Change Password ----------

function showChangePasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) {
        document.getElementById('cp-current').value = '';
        document.getElementById('cp-new').value = '';
        document.getElementById('cp-confirm').value = '';
        modal.style.display = 'flex';
    }
}

function hideChangePasswordModal() {
    const modal = document.getElementById('password-modal');
    if (modal) modal.style.display = 'none';
}

async function submitPasswordChange() {
    const current = document.getElementById('cp-current').value;
    const newPass = document.getElementById('cp-new').value;
    const confirmPass = document.getElementById('cp-confirm').value;

    if (newPass !== confirmPass) {
        if (typeof showToast === 'function') showToast("New passwords do not match", "error");
        else alert("New passwords do not match");
        return;
    }

    if (newPass.length < 4) {
        if (typeof showToast === 'function') showToast("New password must be at least 4 characters", "error");
        else alert("New password must be at least 4 characters");
        return;
    }

    // Determine the current user and their role
    const path = window.location.pathname;
    let username = '';

    if (path.includes('admin')) {
        const adminUser = JSON.parse(localStorage.getItem('adminUser'));
        if (adminUser) username = adminUser.username;
    }

    if (!username) {
        if (typeof showToast === 'function') showToast("Not logged in", "error");
        return;
    }

    const btn = document.querySelector('#password-modal button[type="submit"]');
    if (btn) setButtonLoading(btn, true);

    try {
        const data = await changePasswordAPI(username, current, newPass);
        if (data.success) {
            if (typeof showToast === 'function') showToast("Password updated successfully!", "success");
            hideChangePasswordModal();
            // Optionally log them out or just let them continue
        } else {
            if (typeof showToast === 'function') showToast(data.message || "Failed to update password", "error");
        }
    } catch (err) {
        if (typeof showToast === 'function') showToast("Server error. Try again later.", "error");
    } finally {
        if (btn) setButtonLoading(btn, false, false, "Update Password");
    }
}

document.addEventListener('DOMContentLoaded', checkSessionOnLoad);
