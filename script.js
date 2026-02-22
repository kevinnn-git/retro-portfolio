/* ═══════════════════════════════════════════════════════════
   WASIM.PC — Retro Portfolio  |  script.js
   ═══════════════════════════════════════════════════════════ */

/* ─── State ─── */
let zCounter = 200;
const minimizedState = {};   // winId → true if minimized
const maximizedState = {};   // winId → true if maximized
const originalRect = {};     // winId → {top,left,width,height} before maximize

/* ─── Boot Sequence ─── */
window.addEventListener('DOMContentLoaded', () => {
    const bar = document.getElementById('boot-bar');
    const boot = document.getElementById('boot-screen');
    const desk = document.getElementById('desktop');
    let progress = 0;

    const messages = [
        'Initializing WASIM.OS...',
        'Loading data modules...',
        'Mounting portfolio drive...',
        'Compiling experience logs...',
        'Launching desktop...'
    ];
    const labelEl = document.querySelector('.boot-bar-label');

    const interval = setInterval(() => {
        progress += Math.random() * 14 + 6;
        if (progress >= 100) progress = 100;
        bar.style.width = progress + '%';
        labelEl.textContent = messages[Math.floor((progress / 100) * messages.length)] || messages[messages.length - 1];

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                boot.style.opacity = '0';
                setTimeout(() => {
                    boot.style.display = 'none';
                    desk.style.display = 'block';
                    startClock();
                    buildTaskbar();
                    // Open welcome by default
                    setTimeout(() => openWindow('welcome-win'), 300);
                }, 800);
            }, 600);
        }
    }, 120);
});

/* ─── Clock ─── */
function startClock() {
    const el = document.getElementById('taskbar-clock');
    function tick() {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        el.textContent = `${h}:${m}`;
    }
    tick();
    setInterval(tick, 10000);
}

/* ─── Window registry ─── */
const WINDOW_META = {
    'welcome-win': { icon: '🖥️', label: 'Welcome' },
    'about-win': { icon: '👤', label: 'About Me' },
    'exp-win': { icon: '💼', label: 'Experience' },
    'proj-win': { icon: '📁', label: 'Projects' },
    'skills-win': { icon: '⚙️', label: 'Skills' },
    'edu-win': { icon: '🎓', label: 'Education' },
    'contact-win': { icon: '📧', label: 'Contact' },
};

/* ─── Taskbar ─── */
function buildTaskbar() {
    // Buttons added dynamically as windows open
}

function addToTaskbar(winId) {
    const meta = WINDOW_META[winId];
    if (!meta) return;
    const tbWins = document.getElementById('taskbar-windows');
    if (document.getElementById('tb-' + winId)) return; // already exists
    const btn = document.createElement('button');
    btn.className = 'tb-win-btn';
    btn.id = 'tb-' + winId;
    btn.innerHTML = `${meta.icon} ${meta.label}`;
    btn.onclick = () => toggleFromTaskbar(winId);
    tbWins.appendChild(btn);
}

function removeFromTaskbar(winId) {
    const btn = document.getElementById('tb-' + winId);
    if (btn) btn.remove();
}

function setTaskbarActive(winId) {
    document.querySelectorAll('.tb-win-btn').forEach(b => b.classList.remove('active-tb'));
    const btn = document.getElementById('tb-' + winId);
    if (btn) btn.classList.add('active-tb');
}

function toggleFromTaskbar(winId) {
    const win = document.getElementById(winId);
    if (win.classList.contains('minimized')) {
        restoreWindow(winId);
    } else {
        focusWindow(winId);
    }
}

/* ─── Open / Close / Minimize / Maximize ─── */
function openWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    win.classList.remove('hidden', 'minimized');
    win.classList.add('win-opening');
    setTimeout(() => win.classList.remove('win-opening'), 200);

    focusWindow(winId);
    addToTaskbar(winId);
}

function closeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.add('hidden');
    win.classList.remove('focused');
    minimizedState[winId] = false;
    maximizedState[winId] = false;
    removeFromTaskbar(winId);
}

function minimizeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.add('minimized');
    win.classList.remove('focused');
    minimizedState[winId] = true;
    setTaskbarActive('');
}

function restoreWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.remove('minimized');
    minimizedState[winId] = false;
    focusWindow(winId);
}

function toggleMaximize(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    if (maximizedState[winId]) {
        // Restore
        const r = originalRect[winId];
        if (r) {
            win.style.top = r.top;
            win.style.left = r.left;
            win.style.width = r.width;
            win.style.height = r.height;
        }
        win.classList.remove('maximized');
        maximizedState[winId] = false;
    } else {
        // Save current rect
        originalRect[winId] = {
            top: win.style.top,
            left: win.style.left,
            width: win.style.width,
            height: win.style.height,
        };
        win.classList.add('maximized');
        maximizedState[winId] = true;
    }
    focusWindow(winId);
}

function focusWindow(winId) {
    // Remove focused class from all windows
    document.querySelectorAll('.win98-window').forEach(w => w.classList.remove('focused'));
    const win = document.getElementById(winId);
    if (!win) return;
    zCounter++;
    win.style.zIndex = zCounter;
    win.classList.add('focused');
    setTaskbarActive(winId);
}

// Clicking a window brings it to front
document.addEventListener('mousedown', (e) => {
    const win = e.target.closest('.win98-window');
    if (win) focusWindow(win.id);
});

/* ─── Dragging ─── */
let dragState = null;

function startDrag(e, winId) {
    if (maximizedState[winId]) return;
    const win = document.getElementById(winId);
    const rect = win.getBoundingClientRect();
    dragState = {
        winId,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: rect.left,
        origTop: rect.top,
    };
    focusWindow(winId);
    e.preventDefault();
}

document.addEventListener('mousemove', (e) => {
    if (!dragState) return;
    const win = document.getElementById(dragState.winId);
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    let newLeft = dragState.origLeft + dx;
    let newTop = dragState.origTop + dy;
    // Clamp within desktop
    newLeft = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, newLeft));
    newTop = Math.max(0, Math.min(window.innerHeight - 80, newTop));
    win.style.left = newLeft + 'px';
    win.style.top = newTop + 'px';
});

document.addEventListener('mouseup', () => { dragState = null; });

/* ─── Touch drag support ─── */
function startDragTouch(e, winId) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const win = document.getElementById(winId);
    const rect = win.getBoundingClientRect();
    dragState = {
        winId,
        startX: touch.clientX,
        startY: touch.clientY,
        origLeft: rect.left,
        origTop: rect.top,
        isTouch: true,
    };
    focusWindow(winId);
}
document.addEventListener('touchmove', (e) => {
    if (!dragState || !dragState.isTouch) return;
    const touch = e.touches[0];
    const win = document.getElementById(dragState.winId);
    const dx = touch.clientX - dragState.startX;
    const dy = touch.clientY - dragState.startY;
    win.style.left = (dragState.origLeft + dx) + 'px';
    win.style.top = (dragState.origTop + dy) + 'px';
    e.preventDefault();
}, { passive: false });
document.addEventListener('touchend', () => { dragState = null; });

// Patch titlebar for touch
document.querySelectorAll('.win-titlebar').forEach(tb => {
    const winEl = tb.closest('.win98-window');
    if (winEl) tb.addEventListener('touchstart', e => startDragTouch(e, winEl.id));
});

/* ─── Project Explorer ─── */
function showProject(projId, el) {
    // Update tree items highlight
    document.querySelectorAll('.tree-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');

    // Update content panel
    document.querySelectorAll('.proj-detail').forEach(d => d.classList.remove('active'));
    const detail = document.getElementById(projId);
    if (detail) detail.classList.add('active');
}

/* ─── Tab Switching ─── */
function switchTab(e, tabContentId) {
    // Deactivate all tabs and tab-contents in the same window
    const win = e.target.closest('.win98-window');
    win.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    win.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    e.target.classList.add('active');
    const content = document.getElementById(tabContentId);
    if (content) content.classList.add('active');
}

/* ─── Start Menu ─── */
let startMenuOpen = false;
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-btn');
    startMenuOpen = !startMenuOpen;
    menu.classList.toggle('hidden', !startMenuOpen);
    btn.classList.toggle('pressed', startMenuOpen);
}

// Close start menu on outside click
document.addEventListener('mousedown', (e) => {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-btn');
    if (startMenuOpen && !menu.contains(e.target) && !btn.contains(e.target)) {
        startMenuOpen = false;
        menu.classList.add('hidden');
        btn.classList.remove('pressed');
    }
});

/* ─── Contact Send ─── */
function sendMsg() {
    const ta = document.querySelector('.retro-textarea');
    if (!ta.value.trim()) {
        // Flash the textarea
        ta.style.borderColor = '#c0392b';
        setTimeout(() => { ta.style.borderColor = ''; }, 500);
        return;
    }
    ta.value = '';
    openWindow('msg-dialog');
}

/* ─── Shut Down ─── */
function shutDown() {
    openWindow('shutdown-dialog');
}
function doShutdown() {
    const desk = document.getElementById('desktop');
    desk.style.transition = 'opacity 1s ease';
    desk.style.opacity = '0';
    setTimeout(() => {
        desk.innerHTML = `
      <div style="
        position:fixed;inset:0;background:#000;
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:16px;
      ">
        <div style="font-family:'VT323',monospace;font-size:48px;color:#fff;letter-spacing:4px;">
          It is now safe to close your browser.
        </div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:14px;color:#666;">
          © 2025 Syed Wasim Mahmud
        </div>
        <button onclick="location.reload()" style="
          margin-top:20px;padding:8px 24px;
          font-family:Tahoma,sans-serif;font-size:13px;
          background:#d4d0c8;
          border-top:2px solid #fff;border-left:2px solid #fff;
          border-right:2px solid #404040;border-bottom:2px solid #404040;
          cursor:pointer;
        ">Restart</button>
      </div>
    `;
        desk.style.opacity = '1';
    }, 1000);
}
