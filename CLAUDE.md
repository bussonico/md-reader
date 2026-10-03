# MD Reader — Guía del Proyecto

## Qué es
Lector de libros tipo Kindle para archivos `.md` y `.pdf`. Multi-usuario, con auth, biblioteca personal por usuario, highlights, notas, TOC, búsqueda, temas de lectura y PWA.

**URL producción:** https://md-reader-ebook.vercel.app  
**GitHub:** https://github.com/bussonico/md-reader  
**Local:** `/Users/nicobusso/APPS CLAUDE/md-reader/`

---

## Stack
- **Next.js 14** App Router + TypeScript + Tailwind CSS
- **Supabase** — auth (email+password) + base de datos (books, reading_progress, highlights)
- **Vercel** — deploy (proyecto: `md-reader`, team: `theringsmethod-4170s-projects`)
- **pdfjs-dist** — conversión PDF → markdown en el browser

---

## Deploy
```bash
cd "/Users/nicobusso/APPS CLAUDE/md-reader"
npm install          # solo si no hay node_modules
npx vercel --prod
```
Si node_modules no existe (fue borrado para liberar espacio), primero `npm install`.

---

## Estructura clave

| Archivo | Qué hace |
|---------|----------|
| `app/page.tsx` | Biblioteca principal (lista de libros, import, seed) |
| `app/read/[id]/page.tsx` | Página del lector |
| `app/login/page.tsx` | Login / registro con email+password |
| `app/admin/page.tsx` | Panel admin (crear/borrar/resetear usuarios) |
| `app/api/admin/users/route.ts` | API admin (GET/POST/DELETE/PATCH usuarios) |
| `components/reader/PagedReader.tsx` | **Core del lector** — paginación CSS columns + swipe + long-press |
| `components/library/ImportButton.tsx` | Importar .md / .pdf desde el dispositivo |
| `hooks/useBooks.ts` | CRUD de libros en Supabase |
| `hooks/useProgress.ts` | Progreso de lectura por libro |
| `hooks/useHighlights.ts` | Highlights/notas por libro |
| `lib/pdf.ts` | pdfjs → markdown |
| `middleware.ts` | Protege rutas, redirige a /login si no autenticado |
| `supabase/schema.sql` | Schema de la DB (books, reading_progress, highlights) |

---

## Auth y usuarios

- Solo **email + password** (magic link fue descartado por rate limits de Supabase free tier)
- Admin único: `nicobusso_7@hotmail.com`
- Crear usuarios: ir a `/admin` desde el admin, NO desde el dashboard de Supabase
- La API admin usa `SUPABASE_SERVICE_ROLE_KEY` (solo server-side, nunca al cliente)
- `email_confirm: true` en createUser → usuarios confirman automáticamente, sin email

### Variables de entorno en Vercel
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## PagedReader — cómo funciona

Paginación con **CSS columns**:
- `columns: ${colWidth}px` en el contenedor de contenido
- `transform: translateX(-${currentPage * colWidth}px)` para navegar
- `colWidth = pageWidth - 2 * margin.x` → márgenes iguales por página
- El div interno usa `position: absolute; left: margin.x; width: colWidth` para aplicar márgenes correctamente por cada "página visual"

### Eventos táctiles (IMPORTANTE)
**Solo usar pointer events** — no mezclar con touch events.  
`onPointerDown/Move/Up/Cancel` maneja todo: swipe, long-press y tap.  
`touchAction: 'none'` en el div evita que el browser interfiera con swipes.  
Razón: en mobile, `onTouchStart/End` + `onPointerDown/Up` se disparan juntos y se cancelan mutuamente.

Lógica en `handlePointerUp`:
- `|dx| > 40` y más horizontal que vertical → swipe (navegar página)
- `|dx| < 15` y `|dy| < 15` → tap (navegar por zonas o toggle UI)
- Long-press (500ms sin moverse) → mostrar menú de highlight

---

## Bugs conocidos y fixes

### Libros que vuelven a aparecer después de borrar
**Causa:** el seed corría cuando `books.length === 0`, incluyendo después de borrar.  
**Fix aplicado:** flag en `localStorage` con key `md-reader-seeded-{userId}`. Se setea una sola vez y nunca más seedea aunque la biblioteca quede vacía.

### Swipe no funciona / páginas no responden en mobile
**Causa:** conflicto entre `onTouchStart/End` y `onPointerDown/Up` al mismo tiempo.  
**Fix:** eliminar todos los `onTouchStart/End` y manejar todo desde pointer events + `touchAction: 'none'`.

### Márgenes cortados por página
**Causa:** padding en el contenedor CSS columns solo aplica al inicio/fin del bloque total, no por columna.  
**Fix:** div interno con `position: absolute; left: margin.x; width: colWidth; overflow: hidden`.

### "Email logins are disabled" en Supabase
Ir a Supabase → Authentication → Providers → Email → habilitar.

### Vercel Authentication bloqueando la app
Vercel tiene una opción de "Deployment Protection" que pide login de Vercel.  
Desactivar en: Vercel → Project → Settings → Deployment Protection → off.

### node_modules borrado intencionalmente
El folder local tiene node_modules borrados para liberar espacio (~774MB).  
Antes de desarrollar: `npm install` en la carpeta del proyecto.

---

## Libros cargados en producción

- **La Meditación — Jacobo Grinberg** (cargado en Supabase directamente via REST)
- Los samples `sample1.md` y `sample2.md` fueron removidos del seed

Para agregar libros nuevos al servidor (accesibles a todos los usuarios):
1. Subir el `.md` a `/public/samples/`
2. Agregarlo al array `SAMPLES` en `app/page.tsx`
3. O insertar directo en Supabase con `owner_id` del admin y `is_public: true`

---

## Pendientes / ideas futuras

- [ ] Verificar que el swipe funcione bien en iOS Safari después del fix de pointer events
- [ ] Agregar más libros de Jacobo Grinberg (hay PDFs en jacobogrinberg.org/libros)
- [ ] Panel admin: poder marcar libros como públicos (visibles para todos los usuarios)
- [ ] Modo oscuro en la biblioteca (ahora es fondo claro, el lector sí tiene temas)
