# NadienDev — Portfolio

Sitio estático (HTML + CSS + JavaScript) publicado en GitHub Pages sobre `dev.nadiendev.fun`.

## Estructura

```
index.html          Portada (hero, estadísticas, servicios, destacados)
proyectos.html      Catálogo con filtros por categoría y búsqueda
contacto.html       Formulario (Formspree) + datos de contacto
orenix.html         Página de la marca Orenix (banner + módulos + productos)
admin.html          Panel de edición del contenido
404.html            Página de error

css/site.css        Sistema de diseño compartido (tokens, header, cards, footer)
css/home.css        Estilos exclusivos de la portada
css/contacto.css    Estilos del formulario de contacto
css/orenix.css      Estilos de la página de Orenix
css/admin.css       Estilos del panel

js/site.js          Runtime compartido: carga de datos, render de tarjetas, menú
js/home.js          Portada
js/proyectos.js     Filtros y búsqueda
js/contacto.js      Envío del formulario sin recargar
js/orenix.js        Página de Orenix
js/admin.js         Panel de edición

data/content.json   TODO el contenido del sitio (perfil, stats, redes, proyectos)
```

Ningún HTML lleva CSS embebido: todo vive en `css/`.

## Editar el contenido

**No hace falta tocar HTML.** Todo el texto y los proyectos salen de `data/content.json`.

Abrí **`/admin.html`** (por ejemplo <https://dev.nadiendev.fun/admin.html>) y editá desde ahí:

> **El enlace "Panel" está oculto para las visitas.** Para que aparezca en el menú de este
> navegador, entrá una vez a <https://dev.nadiendev.fun/?admin=on> (o pulsá `Ctrl + Alt + A`
> en cualquier página). Queda guardado en el `localStorage`, así que solo lo ves vos y no hace
> falta repetirlo. Para volver a ocultarlo: `?admin=off` o el mismo atajo.
>
> Ojo: esto **oculta el enlace, no protege la página** — GitHub Pages es estático y no puede
> pedir contraseña. `admin.html` sigue siendo accesible para quien escriba la URL, pero sin tu
> token de GitHub el panel no puede publicar nada, y el token nunca sale de tu navegador.

- **Proyectos** — agregar, editar, duplicar, ocultar, reordenar y eliminar.
- **Perfil** — nombre, rol, tagline, sobre mí, ubicación, correo, endpoint de Formspree.
- **Estadísticas** — los números de la portada.
- **Qué hago** — las tarjetas de servicios.
- **Orenix** — banner, textos y módulos de `orenix.html`.
- **Redes** — los enlaces sociales del hero, el footer y contacto.

Los cambios se guardan solos como borrador en el navegador hasta que publiques.

### Publicar los cambios

Dos opciones, en la pestaña **Guardar / GitHub**:

1. **Descargar `content.json`** y reemplazar el archivo en `data/` con un commit normal.
2. **Publicar en GitHub** directamente desde el panel. Requiere un
   [fine-grained personal access token](https://github.com/settings/tokens?type=beta) con:
   - Repository access: **solo este repositorio**
   - Permissions → Repository permissions → **Contents: Read and write**

   El token queda en el `localStorage` del navegador y solo se envía a `api.github.com`.
   No se sube al repositorio. Si se filtra, revocalo desde GitHub.

Tras publicar, GitHub Pages tarda alrededor de un minuto en reflejar los cambios.

### Campos de un proyecto

| Campo | Para qué sirve |
|---|---|
| `name` / `description` | Título y texto de la tarjeta |
| `category` | `mod`, `modpack`, `datapack`, `server`, `web`, `app`, `bot` — define el filtro |
| `url` | Enlace externo. Vacío = tarjeta sin enlace |
| `image` | URL o ruta local. Vacío = se muestran las iniciales |
| `imageFit` | `contain` para iconos cuadrados, `cover` para capturas anchas |
| `downloads` | Insignia de descargas. `0` la oculta |
| `tags` | Tecnologías. La primera se resalta en verde |
| `role` | Insignia opcional: `Colaborador`, `Mantenedor`, etc. |
| `featured` | Aparece en los destacados de la portada |
| `visible` | Desmarcado = no se muestra en el sitio |

En `proyectos.html` la lista se ordena automáticamente por cantidad de descargas.

## Desarrollo local

El sitio usa `fetch()` para leer `data/content.json`, así que **no funciona abriendo el
HTML con doble clic** (`file://` bloquea la petición). Hace falta un servidor.

En esta máquina no hay Node ni Python instalados, así que el repo trae uno en PowerShell:

```powershell
.\serve.ps1              # http://localhost:8000 y abre el navegador
.\serve.ps1 -Port 3000   # otro puerto
.\serve.ps1 -NoBrowser   # sin abrir el navegador
```

`Ctrl + C` para detenerlo. Sirve con `Cache-Control: no-store`, así que alcanza con
recargar (`F5`) para ver los cambios.

Si Windows bloquea la ejecución del script:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Alternativas: la extensión **Live Server** de VS Code (botón "Go Live"), o `npx serve .`
si algún día instalás Node.
