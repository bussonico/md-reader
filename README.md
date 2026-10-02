# MD Reader — Lector de .md estilo Kindle

E-reader mobile-first para archivos Markdown. Sin backend, sin login. Todo guardado localmente en el dispositivo (IndexedDB).

## Correr en local

```bash
cd md-reader
npm install
npm run dev
```

Abrir `http://localhost:3000`

## Deploy en Vercel

1. Subir el proyecto a GitHub (o usar Vercel CLI):

```bash
npx vercel
```

2. Seleccionar el framework **Next.js** (se detecta automáticamente).
3. No se necesita ninguna variable de entorno.
4. El deploy queda listo en ~1 minuto.

## Instalar en la pantalla de inicio del teléfono

**iPhone (Safari):**
1. Abrir la app en Safari
2. Tocar el ícono de compartir (cuadrado con flecha)
3. "Añadir a pantalla de inicio"
4. La app se instala como una app nativa, sin barras de Safari

**Android (Chrome):**
1. Abrir la app en Chrome
2. Chrome mostrará automáticamente el banner de instalación, o
3. Menú (tres puntos) → "Añadir a pantalla de inicio"

Una vez instalada, funciona **100% offline** (los libros importados se guardan en el dispositivo).

## Importar libros

- Tocar el botón **+** en la biblioteca
- Seleccionar archivos `.md`, `.markdown` o `.txt`
- En escritorio también funciona con **drag & drop**

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Dexie (IndexedDB) para persistencia local
- react-markdown + remark-gfm para renderizado
- PWA con service worker para modo offline
