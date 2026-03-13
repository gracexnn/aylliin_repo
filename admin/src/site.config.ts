// ─── Active tenant configuration ──────────────────────────────────────────
// This is the Aylal brand config. To deploy for a different agency, replace
// this file's contents with the appropriate config from tenants/<id>.config.ts
// ──────────────────────────────────────────────────────────────────────────

// ─── Theme ─────────────────────────────────────────────────────────────────
// Exported separately (not `as const`) so tailwind.config.ts can consume it
// without TypeScript read-only conflicts.
export const theme = {
    colors: {
        primary: {
            50:  '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
        },
        accent: {
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
        },
    },
    heroGradient: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 40%, #0284c7 100%)',
}

// ─── Site config ────────────────────────────────────────────────────────────
const siteConfig = {
    // ─── Brand ──────────────────────────────────────────────────────────────
    name: 'Aylal',
    tagline: 'Аяллын багц',

    // ─── Metadata (client app) ──────────────────────────────────────────────
    fullTitle: 'Aylal — Аяллын багц',
    titleTemplate: '%s | Aylal',
    description:
        'Дэлгэрэнгүй маршрут, орон нутгийн зөвлөгөө, хэрэгтэй мэдээлэл бүхий аяллын багцуудыг олж нээгээрэй.',
    url: 'https://aylal.mn',

    // ─── Favicon / Icons ────────────────────────────────────────────────────
    icons: {
        favicon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },

    // ─── Admin app metadata ─────────────────────────────────────────────────
    admin: {
        title: 'Аяллын админ',
        description: 'Аяллын багцуудыг удирдах админ самбар',
    },

    // ─── Social links ────────────────────────────────────────────────────────
    social: {
        instagram: '#',
        twitter: '#',
        facebook: '#',
    },

    // ─── Navigation ─────────────────────────────────────────────────────────
    nav: [
        { href: '/', label: 'Нүүр' },
        { href: '/guides', label: 'Аяллын багцууд' },
        { href: '/#about', label: 'Бидний тухай' },
    ],

    // ─── Footer ─────────────────────────────────────────────────────────────
    footer: {
        description:
            'Дэлгэрэнгүй маршрут, орон нутгийн зөвлөгөө, хэрэгтэй мэдээлэлтэй аяллын багцуудыг танд хүргэнэ.',
        credit: 'Аялах дуртай хүмүүст зориулан бүтээв.',
        links: {
            Танилцах: [
                { href: '/guides', label: 'Аяллын багцууд' },
                { href: '/#about', label: 'Бидний тухай' },
            ],
            Тусламж: [
                { href: '#contact', label: 'Холбоо барих' },
                { href: '#privacy', label: 'Нууцлалын бодлого' },
                { href: '#terms', label: 'Үйлчилгээний нөхцөл' },
            ],
        },
    },

    // ─── Theme (colors used by tailwind.config.ts) ──────────────────────────
    theme,
} as const

export default siteConfig
