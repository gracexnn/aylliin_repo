import type fallbackSiteConfig from '@/site.config'

type WidenPrimitive<T> = T extends string
        ? string
        : T extends number
            ? number
            : T extends boolean
                ? boolean
                : T

type Widen<T> = T extends ReadonlyArray<infer U>
        ? Array<Widen<U>>
        : T extends Record<string, unknown>
            ? { [K in keyof T]: Widen<T[K]> }
            : WidenPrimitive<T>

type SiteConfig = Widen<typeof fallbackSiteConfig>

const khersuujaalConfig: Partial<SiteConfig> = {
    // Add tenant-specific overrides here. Omitted keys fall back to src/site.config.ts.
    
  name: 'Khersuu Jaal',
  tagline: 'Аяллын багц',
  fullTitle: 'Aylal — Аяллын багц',

  nav: [
      { href: '/', label: 'Нүүр' },
      { href: '/guides', label: 'Маршрутууд' },
      { href: '/contact', label: 'Холбоо барих' },
      { href: '/#about', label: 'Бидний тухай' },
  ],
}

export default khersuujaalConfig
