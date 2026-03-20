import { promises as fs } from 'node:fs'
import path from 'node:path'

function toImportName(fileName, index) {
    const stem = fileName.replace(/\.config\.ts$/i, '')
    const safeStem = stem.replace(/[^a-zA-Z0-9_]/g, '_')
    return `tenant_${safeStem}_${index}`
}

async function main() {
    const appRoot = process.cwd()
    const tenantsDir = path.join(appRoot, 'src', 'tenants')
    const outputFile = path.join(appRoot, 'src', 'tenant-registry.generated.ts')

    let files = []
    try {
        const entries = await fs.readdir(tenantsDir, { withFileTypes: true })
        files = entries
            .filter((entry) => entry.isFile() && /\.config\.ts$/i.test(entry.name))
            .map((entry) => entry.name)
            .sort((a, b) => a.localeCompare(b))
    } catch {
        files = []
    }

    const imports = []
    const mapEntries = []

    files.forEach((fileName, index) => {
        const importName = toImportName(fileName, index)
        const tenantId = fileName.replace(/\.config\.ts$/i, '').toUpperCase()
        const importPath = `./tenants/${fileName}`
        imports.push(`import ${importName} from '${importPath}'`)
        mapEntries.push(`    ${JSON.stringify(tenantId)}: ${importName},`)
    })

    const content = [
        '// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.',
        '// Run: npm run generate:tenant-registry',
        '',
        ...imports,
        imports.length > 0 ? '' : '// No tenant config files found under src/tenants.',
        'export const tenantOverrides = {',
        ...mapEntries,
        '} as const',
        '',
    ].join('\n')

    await fs.writeFile(outputFile, content, 'utf8')
    console.log(`Generated tenant registry: ${path.relative(process.cwd(), outputFile)}`)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
