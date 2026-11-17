// Footer year
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

// Highlight the nav link of the section being read
const links = [...document.querySelectorAll('nav a')];
const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => {
            const on = a.hash === '#' + e.target.id;
            a.classList.toggle('on', on);
            if (on) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
        });
    });
}, { rootMargin: '-30% 0px -60% 0px' });
document.querySelectorAll('main section').forEach(s => io.observe(s));

// Role tabs (BA Continuum India)
const tabs = [...document.querySelectorAll('[role="tab"]')];
const show = t => {
    tabs.forEach(x => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    t.focus();
};
tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', e => {
        const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
        if (!keys.includes(e.key)) return;
        e.preventDefault();
        let next = i;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        show(tabs[next]);
    });
});

// Count up the key numbers (starts only after the welcome popup is closed)
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const counters = [...document.querySelectorAll('[data-n]')];

// The HTML already holds the final numbers (good for no-JS and reduced motion);
// reset to 0 only when we are going to animate.
if (!still) counters.forEach(el => { el.textContent = '0'; });

const run = el => {
    const n = +el.dataset.n;
    const plus = 'plus' in el.dataset ? '+' : '';
    if (still) { el.textContent = n + plus; return; }
    const t0 = performance.now();
    const tick = t => {
        const p = Math.min((t - t0) / 1100, 1);
        el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + (p === 1 ? plus : '');
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};

let started = false;
function startCounters() {
    if (started) return;
    started = true;
    const co = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { run(e.target); co.unobserve(e.target); }
        });
    });
    counters.forEach(el => co.observe(el));
}

// Welcome popup: shown once per browser session
const dlg = document.getElementById('welcome');
let seen = false;
try { seen = sessionStorage.getItem('welcomed') === '1'; } catch (e) { }

if (dlg && typeof dlg.showModal === 'function' && !seen) {
    dlg.showModal();
    dlg.addEventListener('close', () => {
        try { sessionStorage.setItem('welcomed', '1'); } catch (e) { }
        startCounters();
    }, { once: true });
    document.getElementById('w-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
} else {
    startCounters();
}
