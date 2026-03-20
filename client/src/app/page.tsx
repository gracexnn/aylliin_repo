import type { Metadata } from 'next'
import { getLandingSettings } from '@/lib/api'
import siteConfig, { activeTenantId } from '@/tenant-config'

function s<T>(val: T | null | undefined, fallback: T): T {
    return val !== null && val !== undefined && val !== ('' as unknown as T) ? val : fallback
}

// ─── Dynamic metadata for homepage ───────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
    const settings = await getLandingSettings()
    return {
        title: s(settings?.meta_title, siteConfig.fullTitle),
        description: s(settings?.meta_description, siteConfig.description),
        openGraph: {
            title: s(settings?.meta_title, siteConfig.fullTitle),
            description: s(settings?.meta_description, siteConfig.description),
            ...(settings?.og_image_url ? { images: [{ url: settings.og_image_url }] } : {}),
        },
    }
}

type HomeModule = { default: () => Promise<React.ReactElement> }

// Homepage variant routing map.
// Add tenant-specific landing modules here when a tenant needs a distinct design.
const tenantHomeLoaders: Record<string, () => Promise<HomeModule>> = {
    KHERSUUJAAL: () => import('@/components/home-variants/khersuujaal-home'),
    KHERSUUJAAL2: () => import('@/components/home-variants/default-home'),
    KHERSUUJAAL3: () => import('@/components/home-variants/khersuujaal-home'),
    KHERSUUJAAL4: () => import('@/components/home-variants/khersuujaal-home'),
}

const defaultHomeLoader = () => import('@/components/home-variants/default-home')

export default async function HomePage() {
    // Server-side tenant selection keeps only one active home module loaded per request.
    const loadTenantHome = tenantHomeLoaders[activeTenantId] ?? defaultHomeLoader
    const TenantHome = (await loadTenantHome()).default
    return <TenantHome />
}
