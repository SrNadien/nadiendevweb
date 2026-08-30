/* ==========================================================================
   NadienDev — runtime compartido
   Carga data/content.json y expone helpers de render.
   ========================================================================== */

const NadienDev = (() => {
    'use strict';

    const DATA_URL = 'data/content.json';

    const CATEGORIES = {
        mod:      { label: 'Mods',      singular: 'Minecraft Mod' },
        modpack:  { label: 'Modpacks',  singular: 'Modpack' },
        datapack: { label: 'Datapacks', singular: 'Datapack' },
        server:   { label: 'Servidores', singular: 'Servidor Minecraft' },
        web:      { label: 'Web',       singular: 'Sitio Web' },
        app:      { label: 'Sistemas',  singular: 'Sistema' },
        bot:      { label: 'Bots',      singular: 'Bot' }
    };

    /* ---------- utilidades ---------- */

    const escapeHTML = (value) => String(value ?? '').replace(
        /[&<>"']/g,
        (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])
    );

    function formatDownloads(n) {
        const num = Number(n) || 0;
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
        return String(num);
    }

    function initials(name) {
        return String(name || '?')
            .replace(/[^\p{L}\p{N} ]/gu, '')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0].toUpperCase())
            .join('');
    }

    /* ---------- datos ---------- */

    let cache = null;

    async function loadContent() {
        if (cache) return cache;
        const res = await fetch(DATA_URL, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`No se pudo cargar ${DATA_URL} (${res.status})`);
        cache = await res.json();
        return cache;
    }

    /* ---------- render de tarjetas ---------- */

    function projectCard(project) {
        const hasLink = Boolean(project.url);
        const isExternal = /^https?:\/\//i.test(project.url || '');
        const tag = hasLink ? 'a' : 'div';
        const linkAttrs = hasLink
            ? ` href="${escapeHTML(project.url)}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}`
            : '';

        const category = CATEGORIES[project.category] || { singular: project.category };

        const media = project.image
            ? `<img src="${escapeHTML(project.image)}" alt="" loading="lazy" decoding="async"
                    onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'project-card__fallback',textContent:'${escapeHTML(initials(project.name))}'}))">`
            : `<span class="project-card__fallback">${escapeHTML(initials(project.name))}</span>`;

        const fitClass = project.image && project.imageFit !== 'cover'
            ? ' project-card__media--contain'
            : '';

        const downloads = Number(project.downloads) > 0
            ? `<span class="badge badge--downloads"><i class="fa-solid fa-download"></i>${formatDownloads(project.downloads)}</span>`
            : '';

        const role = project.role
            ? `<span class="badge badge--role">${escapeHTML(project.role)}</span>`
            : '';

        const tags = (project.tags || [])
            .map((t, i) => `<span class="tag${i === 0 ? ' tag--accent' : ''}">${escapeHTML(t)}</span>`)
            .join('');

        return `
<${tag} class="project-card reveal"${linkAttrs}>
    <div class="project-card__media${fitClass}">
        ${media}
        <span class="badge">${escapeHTML(category.singular)}</span>
        ${downloads}
        ${role}
    </div>
    <div class="project-card__body">
        <h3 class="project-card__title">${escapeHTML(project.name)}${hasLink ? `<i class="fa-solid ${isExternal ? 'fa-arrow-up-right-from-square' : 'fa-arrow-right'}"></i>` : ''}</h3>
        <p class="project-card__desc">${escapeHTML(project.description)}</p>
        <div class="tags">${tags}</div>
    </div>
</${tag}>`;
    }

    /* ---------- comportamiento global ---------- */

    function initHeader() {
        const header = document.querySelector('.site-header');
        const toggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.site-nav');

        if (header) {
            const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
        }

        if (toggle && nav) {
            toggle.addEventListener('click', () => {
                const open = nav.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', String(open));
            });
            nav.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    nav.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    let observer = null;

    function observeReveals(root = document) {
        const items = root.querySelectorAll('.reveal:not(.is-visible)');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        if (!observer) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, i) => {
                    if (!entry.isIntersecting) return;
                    entry.target.style.transitionDelay = `${Math.min(i * 55, 330)}ms`;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
        }

        items.forEach((el) => observer.observe(el));
    }

    /* Enlace al panel: oculto salvo que este navegador lo tenga activado.
       Se activa visitando cualquier página con ?admin=on y se apaga con ?admin=off
       (o con Ctrl + Alt + A). No es seguridad: solo evita mostrarlo a las visitas. */
    const ADMIN_KEY = 'nadiendev:admin';

    const adminEnabled = () => {
        try {
            return localStorage.getItem(ADMIN_KEY) === '1';
        } catch (err) {
            return false;
        }
    };

    function setAdmin(enabled) {
        try {
            if (enabled) localStorage.setItem(ADMIN_KEY, '1');
            else localStorage.removeItem(ADMIN_KEY);
        } catch (err) {
            console.warn('No se pudo guardar la preferencia del panel:', err);
        }
        paintAdminLinks();
    }

    function paintAdminLinks() {
        const visible = adminEnabled();
        document.querySelectorAll('[data-admin-link]').forEach((el) => { el.hidden = !visible; });
    }

    function initAdminLink() {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('admin');

        if (mode === 'on' || mode === 'off') {
            setAdmin(mode === 'on');
            params.delete('admin');
            const query = params.toString();
            history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash);
        }

        paintAdminLinks();

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                setAdmin(!adminEnabled());
            }
        });
    }

    function initYear() {
        document.querySelectorAll('[data-year]').forEach((el) => {
            el.textContent = new Date().getFullYear();
        });
    }

    function init() {
        initHeader();
        initAdminLink();
        initYear();
        observeReveals();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        CATEGORIES,
        loadContent,
        projectCard,
        observeReveals,
        formatDownloads,
        escapeHTML,
        initials
    };
})();
