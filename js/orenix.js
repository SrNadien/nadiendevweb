(async () => {
    'use strict';

    const { loadContent, projectCard, observeReveals, escapeHTML } = NadienDev;

    let data;
    try {
        data = await loadContent();
    } catch (err) {
        console.error(err);
        return;
    }

    const orenix = data.orenix || {};

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el && value) el.textContent = value;
    };

    const banner = document.getElementById('banner-img');
    if (banner && orenix.banner) banner.src = orenix.banner;

    const logo = document.getElementById('banner-logo');
    if (logo && orenix.logo) {
        logo.src = orenix.logo;
        logo.hidden = false;
        logo.addEventListener('error', () => { logo.hidden = true; }, { once: true });
    }

    setText('orenix-name', orenix.name);
    setText('orenix-tagline', orenix.tagline);
    setText('orenix-intro', orenix.intro);
    setText('orenix-about', orenix.about);

    if (orenix.name) document.title = `${orenix.name} — ${orenix.tagline || 'NadienDev'}`;

    const cta = document.getElementById('orenix-cta');
    if (cta && orenix.ctaText) {
        cta.innerHTML = `<i class="fa-regular fa-paper-plane"></i> ${escapeHTML(orenix.ctaText)}`;
    }

    document.getElementById('orenix-stack').innerHTML = (orenix.stack || [])
        .map((t) => `<span class="tag tag--accent">${escapeHTML(t)}</span>`)
        .join('');

    const team = orenix.team || [];
    if (team.length) {
        document.getElementById('equipo').hidden = false;

        document.getElementById('orenix-team').innerHTML = team.map((m) => {
            const hasLink = Boolean(m.url);
            const tag = hasLink ? 'a' : 'div';
            const attrs = hasLink
                ? ` href="${escapeHTML(m.url)}" target="_blank" rel="noopener noreferrer"`
                : '';

            const avatar = m.avatar
                ? `<img src="${escapeHTML(m.avatar)}" alt=""
                        onerror="this.replaceWith(document.createTextNode('${escapeHTML(NadienDev.initials(m.name))}'))">`
                : escapeHTML(NadienDev.initials(m.name));

            return `
            <${tag} class="orenix-member reveal"${attrs}>
                <div class="orenix-member__avatar">${avatar}</div>
                <div>
                    <div class="orenix-member__name">${escapeHTML(m.name)}${hasLink ? '<i class="fa-solid fa-arrow-up-right-from-square"></i>' : ''}</div>
                    <div class="orenix-member__role">${escapeHTML(m.role || '')}</div>
                </div>
            </${tag}>`;
        }).join('');
    }

    document.getElementById('orenix-services').innerHTML = (orenix.services || []).map((s) => `
        <article class="orenix-service reveal">
            <div class="orenix-service__icon"><i class="${escapeHTML(s.icon || 'fa-solid fa-cube')}"></i></div>
            <h3>${escapeHTML(s.title)}</h3>
            <p>${escapeHTML(s.text)}</p>
        </article>`).join('');

    const products = (orenix.products || [])
        .map((id) => (data.projects || []).find((p) => p.id === id))
        .filter((p) => p && p.visible !== false);

    if (products.length) {
        document.getElementById('productos').hidden = false;
        document.getElementById('orenix-products').innerHTML = products.map(projectCard).join('');
    }

    const footerSocials = document.getElementById('footer-socials');
    if (footerSocials) {
        footerSocials.innerHTML = (data.socials || []).map((s) => `
            <a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer"
               title="${escapeHTML(s.label)}" aria-label="${escapeHTML(s.label)}">
                <i class="${escapeHTML(s.icon)}"></i>
            </a>`).join('');
    }

    observeReveals();
})();
