// Copies site.config.ts into each app's src/ before dev/build.
// Run: node sync-config.mjs
// Auto-runs via predev/prebuild hooks in each app's package.json.
import { copyFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const root = dirname(fileURLToPath(import.meta.url))
const src = resolve(root, 'site.config.ts')
const targets = [
    resolve(root, 'admin/src/site.config.ts'),
    resolve(root, 'client/src/site.config.ts'),
]

for (const dest of targets) {
    copyFileSync(src, dest)
    console.log(`synced → ${dest}`)
}
