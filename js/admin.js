/* ==========================================================================
   NadienDev — panel de edición
   Edita data/content.json sin tocar HTML. Publica vía la API de GitHub
   o descarga el archivo para subirlo a mano (GitHub Pages no corre PHP).
   ========================================================================== */

(() => {
    'use strict';

    const { escapeHTML, initials, formatDownloads, CATEGORIES } = NadienDev;

    const DATA_URL = 'data/content.json';
    const DRAFT_KEY = 'nadiendev:draft';
    const GH_KEY = 'nadiendev:github';
    const GH_TOKEN_KEY = 'nadiendev:github-token';

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    let data = null;
    let dirty = false;
    let editingIndex = -1;
    let filter = '';

    /* ====================== utilidades ====================== */

    let toastTimer;
    function toast(message, isError = false) {
        const el = $('#toast');
        el.className = `toast${isError ? ' toast--error' : ''}`;
        el.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i><span>${escapeHTML(message)}</span>`;
        requestAnimationFrame(() => el.classList.add('is-visible'));
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3800);
    }

    function markDirty(value = true) {
        dirty = value;
        const el = $('#save-state');
        el.textContent = value ? 'Cambios sin publicar' : 'Todo publicado';
        el.classList.toggle('is-dirty', value);
        if (value) saveDraft();
    }

    function saveDraft() {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        } catch (err) {
            console.warn('No se pudo guardar el borrador:', err);
        }
    }

    function slugify(text) {
        return String(text || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `proyecto-${Date.now()}`;
    }

    function toBase64(text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 0x8000) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        }
        return btoa(binary);
    }

    const serialize = () => JSON.stringify(data, null, 2) + '\n';

    /* ====================== pestañas ====================== */

    $$('.admin-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            $$('.admin-tab').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
            $$('.admin-panel').forEach((p) => { p.hidden = true; });
            $(`#panel-${tab.dataset.panel}`).hidden = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    /* ====================== campos simples (data-bind) ====================== */

    const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

    function setPath(obj, path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
        target[last] = value;
    }

    let fieldsWired = false;

    function bindFields() {
        $$('[data-bind]').forEach((input) => {
            const path = input.dataset.bind;
            const isList = input.hasAttribute('data-list');
            const value = getPath(data, path);

            if (input.type === 'checkbox') input.checked = Boolean(value);
            else if (isList) input.value = Array.isArray(value) ? value.join(', ') : '';
            else input.value = value == null ? '' : value;

            if (fieldsWired) return;

            input.addEventListener('input', () => {
                let next;
                if (input.type === 'checkbox') next = input.checked;
                else if (isList) next = input.value.split(',').map((s) => s.trim()).filter(Boolean);
                else next = input.value;

                setPath(data, path, next);
                markDirty();
            });
        });

        fieldsWired = true;
    }

    /* ====================== listas repetibles ====================== */

    const REPEATERS = {
        stats: {
            container: '#stats-list',
            title: (item) => item.label || 'Estadística',
            blank: () => ({ value: '', label: '' }),
            fields: [
                { key: 'value', label: 'Valor', placeholder: '800K+' },
                { key: 'label', label: 'Descripción', placeholder: 'Descargas acumuladas' }
            ]
        },
        skills: {
            container: '#skills-list',
            title: (item) => item.title || 'Tarjeta',
            blank: () => ({ icon: 'fa-solid fa-code', title: '', text: '', tags: [] }),
            fields: [
                { key: 'title', label: 'Título', placeholder: 'Front-end' },
                { key: 'icon', label: 'Icono (Font Awesome)', placeholder: 'fa-solid fa-code', hint: 'Solo iconos <strong>gratuitos</strong> de Font Awesome 6. Los Pro se ven vacíos: buscalos en fontawesome.com/search?o=r&m=free' },
                { key: 'text', label: 'Descripción', type: 'textarea', placeholder: 'Qué hacés en esta área…' },
                { key: 'tags', label: 'Tecnologías (coma)', type: 'list', placeholder: 'JavaScript, CSS3' }
            ]
        },
        socials: {
            container: '#socials-list',
            title: (item) => item.label || 'Red',
            blank: () => ({ label: '', icon: 'fa-brands fa-github', url: '' }),
            fields: [
                { key: 'label', label: 'Nombre', placeholder: 'GitHub' },
                { key: 'icon', label: 'Icono (Font Awesome)', placeholder: 'fa-brands fa-github', hint: 'Solo iconos <strong>gratuitos</strong> de Font Awesome 6.' },
                { key: 'url', label: 'Enlace', type: 'url', placeholder: 'https://github.com/…' }
            ]
        },
        orenixTeam: {
            container: '#orenix-team-list',
            path: 'orenix.team',
            title: (item) => item.name || 'Integrante',
            blank: () => ({ name: '', role: 'Fundador', url: '', avatar: '' }),
            fields: [
                { key: 'name', label: 'Nombre', placeholder: 'Omar Abud' },
                { key: 'role', label: 'Rol', placeholder: 'Fundador' },
                { key: 'url', label: 'Enlace (opcional)', type: 'url', placeholder: 'https://github.com/…' },
                { key: 'avatar', label: 'Foto (opcional)', placeholder: 'images/omar.jpg' }
            ]
        },
        orenixServices: {
            container: '#orenix-services-list',
            path: 'orenix.services',
            title: (item) => item.title || 'Módulo',
            blank: () => ({ icon: 'fa-solid fa-cube', title: '', text: '' }),
            fields: [
                { key: 'title', label: 'Título', placeholder: 'Gestión de stock' },
                { key: 'icon', label: 'Icono (Font Awesome)', placeholder: 'fa-solid fa-laptop-code', hint: 'Solo iconos <strong>gratuitos</strong> de Font Awesome 6. Los Pro se ven vacíos.' },
                { key: 'text', label: 'Descripción', type: 'textarea', placeholder: 'Qué resuelve este módulo…' }
            ]
        }
    };

    /* Devuelve (creando si hace falta) el array que edita cada repetidor */
    function repeaterList(name) {
        const path = REPEATERS[name].path || name;
        let list = getPath(data, path);
        if (!Array.isArray(list)) {
            list = [];
            setPath(data, path, list);
        }
        return list;
    }

    function renderRepeater(name) {
        const config = REPEATERS[name];
        const list = repeaterList(name);
        const container = $(config.container);

        container.innerHTML = list.map((item, i) => `
            <div class="repeat-item" data-index="${i}">
                <div class="repeat-item__head">
                    <strong>${escapeHTML(config.title(item))}</strong>
                    <div class="prow__actions">
                        <button class="icon-btn" type="button" data-move="-1" title="Subir"><i class="fa-solid fa-arrow-up"></i></button>
                        <button class="icon-btn" type="button" data-move="1" title="Bajar"><i class="fa-solid fa-arrow-down"></i></button>
                        <button class="icon-btn icon-btn--danger" type="button" data-remove title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                ${config.fields.map((f) => {
                    const raw = item[f.key];
                    const value = escapeHTML(Array.isArray(raw) ? raw.join(', ') : (raw ?? ''));
                    const input = f.type === 'textarea'
                        ? `<textarea data-key="${f.key}" placeholder="${escapeHTML(f.placeholder || '')}">${value}</textarea>`
                        : `<input type="${f.type === 'url' ? 'url' : 'text'}" data-key="${f.key}" value="${value}" placeholder="${escapeHTML(f.placeholder || '')}">`;
                    const hint = f.hint ? `<small>${f.hint}</small>` : '';
                    return `<div class="f"><label>${escapeHTML(f.label)}</label>${input}${hint}</div>`;
                }).join('')}
            </div>`).join('') || '<p class="admin-panel__hint">Todavía no hay elementos.</p>';
    }

    function wireRepeater(name) {
        const config = REPEATERS[name];
        const container = $(config.container);

        container.addEventListener('input', (e) => {
            const field = e.target.closest('[data-key]');
            if (!field) return;
            const index = Number(field.closest('.repeat-item').dataset.index);
            const key = field.dataset.key;
            const isList = (config.fields.find((f) => f.key === key) || {}).type === 'list';

            repeaterList(name)[index][key] = isList
                ? field.value.split(',').map((s) => s.trim()).filter(Boolean)
                : field.value;

            markDirty();
        });

        container.addEventListener('click', (e) => {
            const item = e.target.closest('.repeat-item');
            if (!item) return;
            const index = Number(item.dataset.index);
            const list = repeaterList(name);

            if (e.target.closest('[data-remove]')) {
                if (!confirm('¿Eliminar este elemento?')) return;
                list.splice(index, 1);
            } else if (e.target.closest('[data-move]')) {
                const delta = Number(e.target.closest('[data-move]').dataset.move);
                const target = index + delta;
                if (target < 0 || target >= list.length) return;
                [list[index], list[target]] = [list[target], list[index]];
            } else {
                return;
            }

            markDirty();
            renderRepeater(name);
        });
    }

    $$('[data-add]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.add;
            repeaterList(name).push(REPEATERS[name].blank());
            markDirty();
            renderRepeater(name);
        });
    });

    /* ====================== proyectos ====================== */

    function renderProjects() {
        const list = data.projects || [];
        const needle = filter.toLowerCase().trim();

        const rows = list
            .map((project, index) => ({ project, index }))
            .filter(({ project }) => !needle || [
                project.name, project.description, (project.tags || []).join(' ')
            ].join(' ').toLowerCase().includes(needle));

        $('#plist').innerHTML = rows.length ? rows.map(({ project, index }) => {
            const category = (CATEGORIES[project.category] || {}).singular || project.category;
            const thumb = project.image
                ? `<img src="${escapeHTML(project.image)}" alt="" loading="lazy">`
                : escapeHTML(initials(project.name));
            const downloads = Number(project.downloads) > 0 ? ` · ${formatDownloads(project.downloads)} descargas` : '';

            return `
            <div class="prow${project.visible === false ? ' is-hidden' : ''}" data-index="${index}">
                <div class="prow__thumb">${thumb}</div>
                <div>
                    <div class="prow__name">
                        ${escapeHTML(project.name || 'Sin nombre')}
                        ${project.featured ? '<span class="pill pill--featured">Destacado</span>' : ''}
                        ${project.visible === false ? '<span class="pill pill--hidden">Oculto</span>' : ''}
                    </div>
                    <div class="prow__meta">${escapeHTML(category)}${downloads}</div>
                </div>
                <div class="prow__actions">
                    <button class="icon-btn" type="button" data-move="-1" title="Subir"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="icon-btn" type="button" data-move="1" title="Bajar"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="icon-btn" type="button" data-toggle title="Mostrar / ocultar">
                        <i class="fa-solid ${project.visible === false ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    </button>
                    <button class="icon-btn" type="button" data-edit title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn" type="button" data-copy title="Duplicar"><i class="fa-regular fa-copy"></i></button>
                    <button class="icon-btn icon-btn--danger" type="button" data-remove title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>`;
        }).join('') : '<p class="admin-panel__hint">No hay proyectos que coincidan con la búsqueda.</p>';
    }

    $('#plist').addEventListener('click', (e) => {
        const row = e.target.closest('.prow');
        if (!row) return;
        const index = Number(row.dataset.index);
        const list = data.projects;

        if (e.target.closest('[data-edit]')) {
            openModal(index);
            return;
        }

        if (e.target.closest('[data-move]')) {
            const delta = Number(e.target.closest('[data-move]').dataset.move);
            const target = index + delta;
            if (target < 0 || target >= list.length) return;
            [list[index], list[target]] = [list[target], list[index]];
        } else if (e.target.closest('[data-toggle]')) {
            list[index].visible = list[index].visible === false;
        } else if (e.target.closest('[data-copy]')) {
            const copy = JSON.parse(JSON.stringify(list[index]));
            copy.name += ' (copia)';
            copy.id = slugify(copy.name);
            copy.featured = false;
            list.splice(index + 1, 0, copy);
        } else if (e.target.closest('[data-remove]')) {
            if (!confirm(`¿Eliminar "${list[index].name}"? Esta acción no se puede deshacer.`)) return;
            list.splice(index, 1);
        } else {
            return;
        }

        markDirty();
        renderProjects();
    });

    $('#admin-search').addEventListener('input', (e) => {
        filter = e.target.value;
        renderProjects();
    });

    $('#btn-new').addEventListener('click', () => openModal(-1));

    /* ---------- modal ---------- */

    const modal = $('#modal');

    const BLANK_PROJECT = () => ({
        id: '', name: '', description: '', category: 'web', url: '', image: '',
        imageFit: 'cover', downloads: 0, tags: [], role: '', featured: false, visible: true
    });

    function openModal(index) {
        editingIndex = index;
        const project = index >= 0 ? data.projects[index] : BLANK_PROJECT();

        $('#modal-title').textContent = index >= 0 ? 'Editar proyecto' : 'Nuevo proyecto';
        $('#m-name').value = project.name || '';
        $('#m-desc').value = project.description || '';
        $('#m-cat').value = project.category || 'web';
        $('#m-downloads').value = Number(project.downloads) || 0;
        $('#m-url').value = project.url || '';
        $('#m-image').value = project.image || '';
        $('#m-fit').value = project.imageFit === 'cover' ? 'cover' : 'contain';
        $('#m-tags').value = (project.tags || []).join(', ');
        $('#m-role').value = project.role || '';
        $('#m-featured').checked = Boolean(project.featured);
        $('#m-visible').checked = project.visible !== false;

        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        $('#m-name').focus();
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = '';
        editingIndex = -1;
    }

    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

    $('#modal-save').addEventListener('click', () => {
        const name = $('#m-name').value.trim();
        if (!name) {
            toast('El proyecto necesita un nombre.', true);
            $('#m-name').focus();
            return;
        }

        const isNew = editingIndex < 0;
        data.projects = data.projects || [];
        const base = isNew ? BLANK_PROJECT() : data.projects[editingIndex];

        const project = Object.assign(base, {
            id: base.id || slugify(name),
            name,
            description: $('#m-desc').value.trim(),
            category: $('#m-cat').value,
            url: $('#m-url').value.trim(),
            image: $('#m-image').value.trim(),
            imageFit: $('#m-fit').value,
            downloads: Number($('#m-downloads').value) || 0,
            tags: $('#m-tags').value.split(',').map((t) => t.trim()).filter(Boolean),
            role: $('#m-role').value.trim(),
            featured: $('#m-featured').checked,
            visible: $('#m-visible').checked
        });

        if (isNew) data.projects.unshift(project);

        markDirty();
        renderProjects();
        closeModal();
        toast(isNew ? 'Proyecto agregado.' : 'Proyecto actualizado.');
    });

    /* ====================== GitHub ====================== */

    const ghConfig = () => ({
        owner: $('#gh-owner').value.trim(),
        repo: $('#gh-repo').value.trim(),
        branch: $('#gh-branch').value.trim() || 'main',
        path: $('#gh-path').value.trim() || 'data/content.json',
        token: $('#gh-token').value.trim()
    });

    function loadGhConfig() {
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(GH_KEY) || '{}');
        } catch (err) { /* configuración corrupta: se ignora */ }

        $('#gh-owner').value = saved.owner || 'SrNadien';
        $('#gh-repo').value = saved.repo || 'nadiendevwebb';
        $('#gh-branch').value = saved.branch || 'main';
        $('#gh-path').value = saved.path || 'data/content.json';

        const token = localStorage.getItem(GH_TOKEN_KEY);
        if (token) {
            $('#gh-token').value = token;
            $('#gh-remember').checked = true;
        }

        ['#gh-owner', '#gh-repo', '#gh-branch', '#gh-path'].forEach((sel) => {
            $(sel).addEventListener('change', persistGhConfig);
        });

        $('#gh-remember').addEventListener('change', persistGhConfig);
        $('#gh-token').addEventListener('change', persistGhConfig);
    }

    function persistGhConfig() {
        const { owner, repo, branch, path, token } = ghConfig();
        localStorage.setItem(GH_KEY, JSON.stringify({ owner, repo, branch, path }));

        if ($('#gh-remember').checked && token) localStorage.setItem(GH_TOKEN_KEY, token);
        else localStorage.removeItem(GH_TOKEN_KEY);
    }

    async function ghRequest(url, options = {}) {
        const { token } = ghConfig();
        const res = await fetch(url, Object.assign({}, options, {
            headers: Object.assign({
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${token}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }, options.headers || {})
        }));

        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || `GitHub respondió ${res.status}`);
        return body;
    }

    const contentsUrl = () => {
        const { owner, repo, path } = ghConfig();
        return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    };

    $('#btn-test').addEventListener('click', async () => {
        const { owner, repo, token, branch } = ghConfig();
        if (!owner || !repo || !token) {
            toast('Completá usuario, repositorio y token.', true);
            return;
        }

        try {
            const file = await ghRequest(`${contentsUrl()}?ref=${encodeURIComponent(branch)}`);
            toast(`Conexión OK — archivo encontrado (${(file.size / 1024).toFixed(1)} KB).`);
        } catch (err) {
            toast(err.message, true);
        }
    });

    async function commitToGitHub() {
        const { owner, repo, token, branch } = ghConfig();
        if (!owner || !repo || !token) {
            toast('Falta configurar GitHub en la pestaña "Guardar".', true);
            $('[data-panel="guardar"]').click();
            return;
        }

        const btn = $('#btn-commit');
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando…';

        try {
            let sha;
            try {
                const current = await ghRequest(`${contentsUrl()}?ref=${encodeURIComponent(branch)}`);
                sha = current.sha;
            } catch (err) {
                sha = undefined; // el archivo todavía no existe: se crea
            }

            await ghRequest(contentsUrl(), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Actualizar contenido del portfolio desde el panel',
                    content: toBase64(serialize()),
                    branch,
                    sha
                })
            });

            markDirty(false);
            localStorage.removeItem(DRAFT_KEY);
            toast('Publicado. GitHub Pages se actualiza en ~1 minuto.');
        } catch (err) {
            toast(err.message, true);
        } finally {
            btn.disabled = false;
            btn.innerHTML = original;
        }
    }

    $('#btn-commit').addEventListener('click', commitToGitHub);
    $('#btn-save').addEventListener('click', commitToGitHub);

    /* ====================== descarga / importación ====================== */

    $('#btn-download').addEventListener('click', () => {
        const blob = new Blob([serialize()], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'content.json';
        link.click();
        URL.revokeObjectURL(link.href);
        toast('Archivo descargado. Reemplazalo en data/content.json y hacé commit.');
    });

    $('#import-file').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const parsed = JSON.parse(await file.text());
            if (!Array.isArray(parsed.projects)) throw new Error('El archivo no tiene una lista de proyectos.');
            data = parsed;
            markDirty();
            renderAll();
            toast('Contenido importado.');
        } catch (err) {
            toast(`No se pudo importar: ${err.message}`, true);
        } finally {
            e.target.value = '';
        }
    });

    $('#btn-discard').addEventListener('click', async () => {
        if (!confirm('¿Descartar el borrador local y volver al contenido publicado?')) return;
        localStorage.removeItem(DRAFT_KEY);
        await loadData(true);
        toast('Borrador descartado.');
    });

    $('#btn-reload').addEventListener('click', async () => {
        if (dirty && !confirm('Tenés cambios sin publicar. ¿Recargar igual?')) return;
        await loadData(true);
        toast('Contenido recargado.');
    });

    /* ====================== arranque ====================== */

    function renderAll() {
        bindFields();
        Object.keys(REPEATERS).forEach(renderRepeater);
        renderProjects();
    }

    async function loadData(force = false) {
        if (!force) {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (draft) {
                try {
                    data = JSON.parse(draft);
                    renderAll();
                    markDirty(true);
                    toast('Se restauró un borrador sin publicar.');
                    return;
                } catch (err) {
                    localStorage.removeItem(DRAFT_KEY);
                }
            }
        }

        try {
            const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            data = await res.json();
            renderAll();
            markDirty(false);
        } catch (err) {
            toast(`No se pudo cargar ${DATA_URL}: ${err.message}`, true);
        }
    }

    window.addEventListener('beforeunload', (e) => {
        if (!dirty) return;
        e.preventDefault();
        e.returnValue = '';
    });

    Object.keys(REPEATERS).forEach(wireRepeater);
    loadGhConfig();
    loadData();
})();
