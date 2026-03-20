import fallbackSiteConfig from '@/site.config'
import { tenantOverrides } from '@/tenant-registry.generated.ts'

type WidenPrimitive<T> = T extends string
        ? string
        : T extends number
            ? number
            : T extends boolean
                ? boolean
                : T

type Widen<T> = T extends ReadonlyArray<infer U>
    ? ReadonlyArray<Widen<U>>
        : T extends Record<string, unknown>
            ? { [K in keyof T]: Widen<T[K]> }
            : WidenPrimitive<T>

type SiteConfig = Widen<typeof fallbackSiteConfig>

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends ReadonlyArray<infer U>
        ? Array<DeepPartial<U>>
        : T[K] extends Record<string, unknown>
          ? DeepPartial<T[K]>
          : T[K]
}

const overrides = tenantOverrides as Record<string, DeepPartial<SiteConfig>>

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeDeep<T>(base: T, override?: DeepPartial<T>): T {
    if (override === undefined) {
        return base
    }

    if (!isRecord(base) || !isRecord(override)) {
        return override as T
    }

    const result: Record<string, unknown> = { ...base }

    for (const key of Object.keys(override) as Array<keyof T>) {
        const keyName = String(key)
        const overrideValue = override[key]
        if (overrideValue === undefined) continue

        const baseValue = (base as Record<string, unknown>)[keyName]

        if (Array.isArray(baseValue)) {
            result[keyName] = overrideValue as unknown[]
            continue
        }

        if (isRecord(baseValue) && isRecord(overrideValue)) {
            result[keyName] = mergeDeep(baseValue, overrideValue)
            continue
        }

        result[keyName] = overrideValue as unknown
    }

    return result as T
}

const tenantId = (process.env.TENANT_ID ?? process.env.NEXT_PUBLIC_TENANT_ID ?? '').toUpperCase().trim()
const tenantOverride = overrides[tenantId]

if (process.env.NODE_ENV === 'development' && tenantId && !tenantOverride) {
    const availableTenantIds = Object.keys(overrides).sort().join(', ') || 'none'
    throw new Error(
        `Unknown TENANT_ID "${tenantId}". Add src/tenants/${tenantId}.config.ts, then run dev/build again. Available tenant IDs: ${availableTenantIds}`,
    )
}

const siteConfig = mergeDeep(fallbackSiteConfig as SiteConfig, tenantOverride)

export const activeTenantId = tenantId || 'DEFAULT'
export const theme = siteConfig.theme
export default siteConfig
