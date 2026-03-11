/**
 * Shared site config — edit values here.
 * Keep in sync with: admin/src/site.config.ts
 */

const siteConfig = {
    // ─── Brand ────────────────────────────────────────────────────────────────
    name: 'Aylal',
    tagline: 'Аяллын багц',

    // ─── Metadata (client app) ────────────────────────────────────────────────
    fullTitle: 'Aylal — Аяллын багц',
    titleTemplate: '%s | Aylal',
    description:
        'Дэлгэрэнгүй маршрут, орон нутгийн зөвлөгөө, хэрэгтэй мэдээлэл бүхий аяллын багцуудыг олж нээгээрэй.',
    url: 'https://aylal.mn',

    // ─── Favicon / Icons ─────────────────────────────────────────────────────
    icons: {
        favicon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },

    // ─── Admin app metadata ───────────────────────────────────────────────────
    admin: {
        title: 'Аяллын админ',
        description: 'Аяллын багцуудыг удирдах админ самбар',
    },

    // ─── Social links ─────────────────────────────────────────────────────────
    social: {
        instagram: '#',
        twitter: '#',
        facebook: '#',
    },

    // ─── Navigation ───────────────────────────────────────────────────────────
    nav: [
        { href: '/', label: 'Нүүр' },
        { href: '/guides', label: 'Аяллын багцууд' },
        { href: '/#about', label: 'Бидний тухай' },
    ],

    // ─── Footer ───────────────────────────────────────────────────────────────
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
} as const

export default siteConfig
