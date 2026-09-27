# The Morning Catch

An interactive 3D fish-market prototype built with Next.js, React Three Fiber, Three.js, and TypeScript. The market is rendered as one navigable WebGL scene; local product data and the frontend basket are for demonstration only.

## Run locally

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), wait for the market to load, then choose **Enter the market**. Mouse wheel, trackpad, touch, keyboard, or the on-screen navigation move between counters.

For a production build:

```bash
npm run build
npm run start
```

## Assets

The scene textures are included in `public/textures/` and are served locally by Next.js:

- `floor.jpg` — wet market floor
- `ice.jpg` — counter ice beds
- `wall.jpg` — tiled hall walls
- `poster.jpg` — loading / entrance artwork

Keep this directory in the repository; it is part of the market experience and is not fetched from a third-party asset host.

## Vercel

Import this repository as a Next.js project and deploy with the default Next.js build settings. The market UI and demo basket do not require a database. `DATABASE_URL` is only needed if using the PostgreSQL-backed `/api/health` check from the template. Do not commit `.env` files or credentials.

## Project structure

- `src/components/market/` — WebGL scene, counters, navigation, product and basket UI
- `src/data/products.ts` — replaceable local product catalogue
- `src/lib/camera.ts` — market stations and camera path
- `src/lib/store.ts` — prototype navigation and basket state
- `public/textures/` — locally bundled scene textures
