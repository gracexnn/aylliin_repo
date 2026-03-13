/**
 * sync-config.mjs
 *
 * Copies the selected tenant's config into each app's src/ before dev/build.
 *
 * Usage:
 *   node sync-config.mjs                 # uses TENANT_ID env var (default: aylal)
 *   TENANT_ID=my-agency node sync-config.mjs
 *
 * Auto-runs via predev/prebuild hooks in each app's package.json.
 *
 * To add a new tenant:
 *   1. Create  tenants/<agency-id>.config.ts  (copy from tenants/_template.config.ts)
 *   2. Deploy with  TENANT_ID=<agency-id>  set in the environment.
 */
import { copyFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const root = dirname(fileURLToPath(import.meta.url))

const tenantId = process.env.TENANT_ID ?? 'aylal'
const src = resolve(root, 'tenants', `${tenantId}.config.ts`)

if (!existsSync(src)) {
    console.error(`\n  ✖  Tenant config not found: ${src}`)
    console.error(`     Create  tenants/${tenantId}.config.ts  (see tenants/_template.config.ts)\n`)
    process.exit(1)
}

const targets = [
    resolve(root, 'admin/src/site.config.ts'),
    resolve(root, 'client/src/site.config.ts'),
]

for (const dest of targets) {
    copyFileSync(src, dest)
    console.log(`synced [${tenantId}] → ${dest}`)
}
