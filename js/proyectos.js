/* ==========================================================================
   NadienDev — página de proyectos (filtros + búsqueda)
   ========================================================================== */

(async () => {
    'use strict';

    const { loadContent, projectCard, observeReveals, escapeHTML, CATEGORIES } = NadienDev;

    const grid = document.getElementById('grid');
    const filtersEl = document.getElementById('filters');
    const searchEl = document.getElementById('search');
    const noteEl = document.getElementById('results-note');

    let projects = [];
    let activeCategory = 'all';
    let query = '';

    const normalize = (s) => String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');

    function matches(project) {
        if (activeCategory !== 'all' && project.category !== activeCategory) return false;
        if (!query) return true;

        const haystack = normalize([
            project.name,
            project.description,
            project.role,
            (project.tags || []).join(' '),
            (CATEGORIES[project.category] || {}).singular
        ].join(' '));

        return normalize(query).split(/\s+/).every((word) => haystack.includes(word));
    }

    function render() {
        const list = projects.filter(matches);

        grid.innerHTML = list.length
            ? list.map(projectCard).join('')
            : `<div class="empty-state">
                   <p><strong>Sin resultados.</strong></p>
                   <p>Probá con otro término o quitá los filtros.</p>
               </div>`;

        noteEl.textContent = `${list.length} de ${projects.length} proyectos`;

        filtersEl.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(btn.dataset.cat === activeCategory));
        });

        observeReveals(grid);
    }

    function buildFilters() {
        const counts = projects.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});

        const options = [{ key: 'all', label: 'Todos', count: projects.length }].concat(
            Object.keys(CATEGORIES)
                .filter((key) => counts[key])
                .map((key) => ({ key, label: CATEGORIES[key].label, count: counts[key] }))
        );

        filtersEl.innerHTML = options.map((o) => `
            <button class="filter-btn" type="button" data-cat="${escapeHTML(o.key)}" aria-pressed="false">
                ${escapeHTML(o.label)}<span class="count">${o.count}</span>
            </button>`).join('');

        filtersEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            activeCategory = btn.dataset.cat;
            render();
        });
    }

    let debounce;
    searchEl.addEventListener('input', (e) => {
        clearTimeout(debounce);
        const value = e.target.value;
        debounce = setTimeout(() => {
            query = value.trim();
            render();
        }, 140);
    });

    /* ---------- carga ---------- */
    let data;
    try {
        data = await loadContent();
    } catch (err) {
        console.error(err);
        grid.innerHTML = `<div class="empty-state">
            <p><strong>No se pudieron cargar los proyectos.</strong></p>
            <p>Revisá que <code>data/content.json</code> exista y sea JSON válido.</p>
        </div>`;
        return;
    }

    projects = (data.projects || [])
        .filter((p) => p.visible !== false)
        .sort((a, b) => (Number(b.downloads) || 0) - (Number(a.downloads) || 0));

    const intro = document.getElementById('intro');
    if (intro && data.profile && data.profile.projectsIntro) {
        intro.textContent = data.profile.projectsIntro;
    }

    /* Footer dinámico */
    const socials = data.socials || [];
    const footerSocials = document.getElementById('footer-socials');
    if (footerSocials) {
        footerSocials.innerHTML = socials.map((s) => `
            <a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer"
               title="${escapeHTML(s.label)}" aria-label="${escapeHTML(s.label)}">
                <i class="${escapeHTML(s.icon)}"></i>
            </a>`).join('');
    }

    const footerAbout = document.getElementById('footer-about');
    if (footerAbout && data.profile) {
        footerAbout.textContent = data.profile.about || data.profile.tagline || footerAbout.textContent;
    }

    buildFilters();
    render();
})();
