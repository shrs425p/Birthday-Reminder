// ============================================================
//  home.js — Premium V2 Dashboard
// ============================================================

// --- 1. Dynamic Greeting ---
function updateGreeting() {
    const hour = new Date().getHours();
    const titleEl = document.getElementById('dynamicGreeting');
    if (!titleEl) return;
    if (hour < 12) titleEl.innerText = 'Good Morning!';
    else if (hour < 17) titleEl.innerText = 'Good Afternoon!';
    else titleEl.innerText = 'Good Evening!';
}

// --- 2. Confetti Celebration ---
function triggerCelebration() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#fbbf24', '#ffffff'],
            disableForReducedMotion: true
        });
    }
}

function getUpcomingTurningAge(dob) {
    const birth = new Date(dob);
    if (!birth || Number.isNaN(birth.getTime())) return '—';
    const today = new Date();
    const thisYearBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    let nextBirthday = thisYearBirthday;
    if (thisYearBirthday < today) nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    return nextBirthday.getFullYear() - birth.getFullYear();
}

// --- 3. Render Today's Birthday Wall ---
function renderTodaysBirthdays(birthdays) {
    const listEl = document.getElementById('home-birthdays-list');
    if (!listEl) return;

    if (birthdays.length === 0) {
        listEl.innerHTML = `
            <div class="birthday-empty-state">
                <div class="birthday-empty-icon">🎂</div>
                <h3>No birthdays today</h3>
                <p>Enjoy the calm — check back tomorrow!</p>
            </div>
        `;
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const avatarEmojis = ['🎉', '🎂', '🥳', '🎁', '⭐', '🎈'];
    const deptColors = {
        'CSE AIML': { soft: 'var(--blue-soft)', color: 'var(--blue)' },
        'Computer': { soft: 'var(--blue-soft)', color: 'var(--blue)' },
        'ENTC': { soft: 'var(--purple-soft)', color: 'var(--purple)' },
        'Mech': { soft: 'var(--amber-soft)', color: 'var(--amber)' },
        'Chem': { soft: 'var(--red-soft)', color: 'var(--red)' },
        'Civil': { soft: 'var(--amber-soft)', color: 'var(--amber)' }
    };
    let html = '';

    birthdays.forEach((b, idx) => {
        const dobDate = new Date(b.dob);
        const deptName = (b.dept || b.department || b.Dept || '').trim();
        const turnAge = getUpcomingTurningAge(b.dob);
        const emoji = avatarEmojis[idx % avatarEmojis.length];
        const dcolor = deptName && deptColors[deptName] ? deptColors[deptName] : { soft: 'var(--gray-100)', color: 'var(--gray-600)' };
        const deptBadge = deptName
            ? `<span class="badge" style="background:${dcolor.soft};color:${dcolor.color};margin-left:8px;font-size:11px;">${deptName}</span>`
            : '';
        const subtitle = deptName
            ? `${deptName} • Turning ${turnAge}`
            : `Turning ${turnAge}`;

        html += `
            <div class="glass-card birthday-card-v2" data-dept="${b.dept || ''}" style="border-left-color:${dcolor.color};">
                <div class="bday-avatar-v2">${emoji}</div>
                <div class="bday-info-v2" style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                    <h3 class="bday-name-v2">${b.name}${deptBadge}</h3>
                    <p class="bday-sub-v2">${subtitle}</p>
                    ${b.note ? `<span class="bday-note">"${b.note}"</span>` : ''}
                </div>
                <button class="send-wish-card-btn" data-birthday-id="${b.id}" data-email="${b.email || ''}" data-name="${b.name}" style="margin-left:auto;">🎁 Send Wish</button>
            </div>
        `;
    });

    listEl.innerHTML = html;

    const buttons = listEl.querySelectorAll('.send-wish-card-btn');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const email = btn.dataset.email;
            const name = btn.dataset.name || '';
            if (!email) {
                if (typeof showToast === 'function') showToast('No email available for this student', 'error');
                return;
            }
            const subject = encodeURIComponent(`Happy Birthday ${name}! 🎂`);
            const body = encodeURIComponent(`Hey ${name},\n\nWishing you a very Happy Birthday! Hope your day is filled with joy and celebrations! 🎉🎂\n\nBest wishes!`);
            window.open(`mailto:${email}?subject=${subject}&body=${body}`);
        });
    });

    triggerCelebration();
}

// --- 4. Render Milestone Carousel ---
function renderMilestoneCarousel(upcoming) {
    const carouselEl = document.getElementById('milestone-carousel');
    if (!carouselEl) return;

    if (upcoming.length === 0) {
        carouselEl.innerHTML = `<div style="padding: 20px; color: var(--gray-600); font-size: 14px;">No upcoming milestones in the next 7 days.</div>`;
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const gradients = [
        'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)',
        'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
        'linear-gradient(135deg, #3a0ca3 0%, #4361ee 100%)',
        'linear-gradient(135deg, #7b2d8b 0%, #c9184a 100%)',
    ];
    const milestoneEmojis = ['🌟', '🎉', '🎊', '🎂', '⭐'];

    let html = '';
    upcoming.forEach((b, idx) => {
        const dobDate = new Date(b.dob);
        const deptName = (b.dept || b.department || b.Dept || '').trim();
        const turnAge = getUpcomingTurningAge(b.dob);
        const gradient = gradients[idx % gradients.length];
        const emoji = milestoneEmojis[idx % milestoneEmojis.length];

        // Format birthday date for this year
        const bdayThisYear = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
        const dateStr = bdayThisYear.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        const lineTwo = deptName ? `${deptName} • ${dateStr}` : dateStr;

        html += `
            <div class="milestone-card" style="background:${gradient};">
                <span class="badge badge-milestone">Turning ${turnAge}!</span>
                <h3 style="margin-top:12px;font-size:1.1rem;font-weight:700;">${b.name}</h3>
                <p style="font-size:13px;opacity:0.8;margin-top:4px;">${lineTwo}</p>
                <div class="milestone-icon">${emoji}</div>
            </div>
        `;
    });

    carouselEl.innerHTML = html;
}

// --- 5. Mini Calendar ---
function renderMiniCalendar() {
    const grid = document.getElementById('calendar-grid');
    const label = document.getElementById('calendar-month-year');
    if (!grid || !label) return;

    const today = new Date();
    label.innerText = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    let html = `
        <div class="calendar-day-label">M</div>
        <div class="calendar-day-label">T</div>
        <div class="calendar-day-label">W</div>
        <div class="calendar-day-label">T</div>
        <div class="calendar-day-label">F</div>
        <div class="calendar-day-label">S</div>
        <div class="calendar-day-label">S</div>
    `;

    for (let i = 0; i < startOffset; i++) html += `<div></div>`;
    for (let i = 1; i <= daysInMonth; i++) {
        const cls = i === today.getDate() ? 'today' : '';
        html += `<div class="calendar-day ${cls}">${i}</div>`;
    }

    grid.innerHTML = html;
}

// --- 6. Today's Actions Widget ---
function renderTodaysActions(allBirthdays, todaysBirthdays) {
    const container = document.getElementById('todays-actions-content');
    if (!container) return;

    // Next birthday countdown logic
    const today = new Date();
    let nextWho = null;
    let nextDays = Infinity;

    allBirthdays.forEach((b) => {
        if (!b.dob) return;
        const parts = b.dob.split('-');
        if (parts.length !== 3) return;
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        let target = new Date(today.getFullYear(), month, day);
        target.setHours(0,0,0,0);
        if (target < today) {
            target = new Date(today.getFullYear()+1, month, day);
        }
        const diff = Math.round((target - today) / (1000*60*60*24));
        if (diff < nextDays) {
            nextDays = diff;
            nextWho = b.name;
        }
    });

    const nextLine = (todaysBirthdays.length > 0)
        ? `🎉 ${todaysBirthdays[0].name}'s birthday is TODAY!`
        : nextWho ? `🎂 Next: ${nextWho} in ${nextDays} day(s)` : '🎂 No upcoming birthdays';

    const countLine = `👥 ${todaysBirthdays.length} birthday${todaysBirthdays.length === 1 ? '' : 's'} today`;

    container.innerHTML = `
        <div class="action-row"><span>${nextLine}</span></div>
        <div class="action-row"><span>${countLine}</span></div>
        <div>
            <button id="wish-all-btn" class="send-wishes-btn" style="background:var(--amber);border-color:var(--amber);color:#fff;margin-top:6px;">🎁 Wish All Today's Birthdays</button>
        </div>
    `;

    // Wire up the Wish All button to open individual mailto links (100ms apart)
    const wishAllBtn = container.querySelector('#wish-all-btn');
    if (wishAllBtn) {
        if (!Array.isArray(todaysBirthdays) || todaysBirthdays.length === 0) {
            wishAllBtn.disabled = true;
            wishAllBtn.textContent = 'No birthdays today';
        } else {
            wishAllBtn.disabled = false;
            wishAllBtn.addEventListener('click', () => {
                const emails = Array.isArray(todaysBirthdays) ? todaysBirthdays.map(s => s.email).filter(Boolean) : [];
                if (emails.length === 0) {
                    if (typeof showToast === 'function') showToast('No email addresses available for today\'s birthdays', 'error');
                    return;
                }
                const bccList = emails.join(',');
                const subject = encodeURIComponent(`Happy Birthday! 🎂`);
                const body = encodeURIComponent(`Hey,\n\nWishing you a very Happy Birthday! Hope your day is filled with joy and celebrations! 🎉🎂\n\nBest wishes!`);
                window.open(`mailto:?bcc=${bccList}&subject=${subject}&body=${body}`);
            });
        }
    }
}

// --- 7. Main Init ---
async function fetchHomeData() {
    updateGreeting();
    renderMiniCalendar();
    if (typeof feather !== 'undefined') feather.replace();

    try {
        const [todayData, upcomingData, allData] = await Promise.all([
            fetchTodaysBirthdaysAPI(),
            fetchUpcomingBirthdaysAPI(),
            fetchBirthdaysAPI()
        ]);

        if (todayData && todayData.success) {
            renderTodaysBirthdays(todayData.birthdays);
            const statToday = document.getElementById('stat-today');
            if (statToday) statToday.innerText = todayData.birthdays.length;
        }

        if (upcomingData && upcomingData.success) {
            renderMilestoneCarousel(upcomingData.birthdays);
        }

        if (allData && allData.success) {
            // Original code for departments
            const depts = new Set(allData.birthdays.filter(b => b.dept).map(b => b.dept));
            const countEl = document.getElementById('total-student-count');
            if (countEl) countEl.innerText = `${depts.size} Depts`;

            // New Quick Stats section
            const statTotal = document.getElementById('stat-total');
            if (statTotal) statTotal.innerText = allData.birthdays.length;

            const statMonth = document.getElementById('stat-month');
            if (statMonth) {
                const currentMonth = new Date().getMonth() + 1;
                const thisMonthCount = allData.birthdays.filter(b => {
                    const dob = new Date(b.dob);
                    return (dob.getMonth() + 1) === currentMonth;
                }).length;
                statMonth.innerText = thisMonthCount;
            }
        }

        // Today's Actions widget
        if (allData && allData.success && todayData && todayData.success) {
            renderTodaysActions(allData.birthdays, todayData.birthdays);
        } else {
            renderTodaysActions([], []);
        }

    } catch (err) {
        console.error('fetchHomeData error:', err);
    }
}

document.addEventListener('DOMContentLoaded', fetchHomeData);
