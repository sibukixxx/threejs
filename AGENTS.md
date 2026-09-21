# threejs

Vite/TypeScript Three.js application.

## Commands
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Shared rules
- Keep scene/render lifecycle cleanup explicit; resources/listeners introduced by a component must be released when the existing architecture expects teardown.
- Follow the existing npm/package-lock tooling.
- Static assets and shader/source files are source; `dist/` build output is generated.
- Do not weaken TypeScript/lint settings to bypass errors from scene code.

## Change-dependent checks
- TypeScript/scene/UI: `npm run build && npm run lint`.
- Asset/shader changes: build and visually verify representative scene when possible.

## Done
- Build/lint pass.
- Resource lifecycle behavior is preserved.
- Visual-only checks not run are reported.
