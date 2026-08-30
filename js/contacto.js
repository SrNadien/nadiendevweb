/* ==========================================================================
   NadienDev — página de contacto
   ========================================================================== */

(async () => {
    'use strict';

    const { loadContent, escapeHTML } = NadienDev;

    const form = document.getElementById('contact-form');
    const note = document.getElementById('form-note');
    const submitBtn = document.getElementById('submit-btn');

    /* ---------- contenido dinámico ---------- */
    try {
        const data = await loadContent();
        const profile = data.profile || {};
        const socials = data.socials || [];

        if (profile.name) document.getElementById('info-name').textContent = profile.name;
        if (profile.location) document.getElementById('info-location').textContent = profile.location;

        if (profile.email) {
            document.getElementById('info-email').innerHTML =
                `<a href="mailto:${escapeHTML(profile.email)}">${escapeHTML(profile.email)}</a>`;
        }

        if (profile.formspree) form.setAttribute('action', profile.formspree);

        if (profile.available) {
            document.getElementById('availability').hidden = false;
            document.getElementById('availability-text').textContent =
                profile.availableText || 'Disponible para nuevos proyectos';
        }

        const socialsHTML = socials.map((s) => `
            <a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer"
               title="${escapeHTML(s.label)}" aria-label="${escapeHTML(s.label)}">
                <i class="${escapeHTML(s.icon)}"></i>
            </a>`).join('');

        document.getElementById('contact-socials').innerHTML = socialsHTML;
        document.getElementById('footer-socials').innerHTML = socialsHTML;

        const footerAbout = document.getElementById('footer-about');
        if (footerAbout) footerAbout.textContent = profile.about || footerAbout.textContent;
    } catch (err) {
        console.error(err);
    }

    /* ---------- envío sin recargar la página ---------- */
    const show = (message, ok) => {
        note.hidden = false;
        note.textContent = message;
        note.style.borderColor = ok ? 'var(--accent-line)' : 'rgba(255,107,107,.4)';
        note.style.background = ok ? 'var(--accent-soft)' : 'rgba(255,107,107,.1)';
        note.style.color = ok ? 'var(--accent)' : '#ff8f8f';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        const original = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando…';

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });

            if (res.ok) {
                form.reset();
                show('¡Mensaje enviado! Te respondo a la brevedad.', true);
            } else {
                show('No se pudo enviar el mensaje. Escribime por correo o Discord.', false);
            }
        } catch (err) {
            console.error(err);
            show('Error de conexión. Revisá tu internet e intentá de nuevo.', false);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = original;
        }
    });
})();
