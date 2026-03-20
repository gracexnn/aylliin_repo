# Tenant Home Variants Structure

This folder contains server-rendered homepage variants selected by tenant id.

## Why this exists

- Keep one shared app and route to tenant-specific landing layouts.
- Preserve performance by loading only the active tenant homepage module.
- Avoid shipping all homepage variants to every tenant.

## How routing works

1. `src/app/page.tsx` reads `activeTenantId` from `src/tenant-config.ts`.
2. `tenantHomeLoaders` maps tenant ids to a module import.
3. The selected module is imported and rendered.
4. If no tenant mapping exists, `default-home.tsx` is used.

## Files in this folder

- `default-home.tsx`: safe fallback homepage.
- `khersuujaal-home.tsx`: tenant adapter entrypoint for KHERSUUJAAL.
- `plain-home.tsx`: elegant bright style variant currently used by KHERSUUJAAL adapter.

## Add a new tenant homepage variant

1. Create `src/components/home-variants/<tenant>-home.tsx`.
2. Implement layout there, or delegate to another variant component.
3. Add tenant id mapping in `src/app/page.tsx` under `tenantHomeLoaders`.
4. Keep metadata centralized in `src/app/page.tsx` unless tenant needs custom metadata behavior.

## Performance notes

- Keep tenant selection server-side.
- Avoid importing heavy client-only packages in shared entry files.
- Put heavy visual logic inside the tenant variant module that needs it.
