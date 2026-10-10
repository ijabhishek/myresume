document.getElementById('yr').textContent = new Date().getFullYear();

// Highlight the nav link of the section being read
const links = [...document.querySelectorAll('nav a')];
const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
}), { rootMargin: '-30% 0px -60% 0px' });
document.querySelectorAll('main section').forEach(s => io.observe(s));

// Role tabs (BA Continuum India)
const tabs = [...document.querySelectorAll('[role="tab"]')];
const show = t => {
    tabs.forEach(x => {
        const on = x === t;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    t.focus();
};
tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        show(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]);
    });
});

// Count up the key numbers (starts only after the welcome popup is closed)
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const run = el => {
    const n = +el.dataset.n, plus = 'plus' in el.dataset ? '+' : '';
    if (still) return (el.textContent = n + plus);
    const t0 = performance.now();
    (function tick(t) {
        const p = Math.min((t - t0) / 1100, 1);
        el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + (p === 1 ? plus : '');
        if (p < 1) requestAnimationFrame(tick);
    })(t0);
};
function startCounters() {
    const co = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { run(e.target); co.unobserve(e.target); }
    }));
    document.querySelectorAll('[data-n]').forEach(el => co.observe(el));
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