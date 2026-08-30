/* ==========================================================================
   NadienDev — portada
   ========================================================================== */

(async () => {
    'use strict';

    const { loadContent, projectCard, observeReveals, escapeHTML } = NadienDev;

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el && value) el.textContent = value;
    };

    const socialsHTML = (socials = []) => socials.map((s) => `
        <a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer"
           title="${escapeHTML(s.label)}" aria-label="${escapeHTML(s.label)}">
            <i class="${escapeHTML(s.icon)}"></i>
        </a>`).join('');

    let data;
    try {
        data = await loadContent();
    } catch (err) {
        console.error(err);
        return;
    }

    const { profile = {}, stats = [], skills = [], socials = [], projects = [] } = data;

    /* Hero */
    set('hero-role', profile.role);
    set('hero-tagline', profile.tagline);
    set('footer-about', profile.about || profile.tagline);

    if (profile.available) {
        const status = document.getElementById('hero-status');
        if (status) status.hidden = false;
        set('hero-status-text', profile.availableText);
    }

    document.getElementById('hero-socials').innerHTML = socialsHTML(socials);
    document.getElementById('footer-socials').innerHTML = socialsHTML(socials);

    /* Estadísticas */
    document.getElementById('stats').innerHTML = stats.map((s) => `
        <div class="stat">
            <div class="stat__value">${escapeHTML(s.value)}</div>
            <div class="stat__label">${escapeHTML(s.label)}</div>
        </div>`).join('');

    /* Skills */
    document.getElementById('skills').innerHTML = skills.map((s) => `
        <article class="skill-card reveal">
            <div class="skill-card__icon"><i class="${escapeHTML(s.icon)}"></i></div>
            <h3>${escapeHTML(s.title)}</h3>
            <p>${escapeHTML(s.text)}</p>
            <div class="tags">
                ${(s.tags || []).map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
            </div>
        </article>`).join('');

    /* Destacados */
    const featured = projects
        .filter((p) => p.visible !== false && p.featured)
        .slice(0, 6);

    document.getElementById('featured').innerHTML = featured.map(projectCard).join('');

    observeReveals();
})();
