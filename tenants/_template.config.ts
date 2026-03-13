/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TENANT CONFIG TEMPLATE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  HOW TO ADD A NEW TRAVEL AGENCY (TENANT)
 *  ────────────────────────────────────────
 *  1. Copy this file to  tenants/<agency-id>.config.ts
 *     e.g.  tenants/nomadic-trails.config.ts
 *
 *  2. Fill in every value below with the agency's branding.
 *
 *  3. Add the agency's logo / favicon files to:
 *       client/public/  (e.g. favicon.ico, apple-touch-icon.png, logo.png)
 *     (You can keep separate asset sets per tenant in  client/public/<agency-id>/)
 *
 *  4. Copy  tenants/<agency-id>.config.ts  into both app config locations:
 *       cp tenants/<agency-id>.config.ts admin/src/site.config.ts
 *       cp tenants/<agency-id>.config.ts client/src/site.config.ts
 *     Commit these files — they are tracked in git and deployed as-is.
 *
 *  5. Provision a fresh PostgreSQL database for this agency and note the URL.
 *     Each agency gets its own completely isolated database — no data mixing.
 *
 *  6. Copy  admin/.env.example → admin/.env.local  for the new deployment and
 *     set at minimum:
 *       DATABASE_URL=postgresql://user:pass@host:5432/<agency_db>
 *     See admin/.env.example for all required variables.
 *
 *  7. Bootstrap the new database:
 *       cd admin
 *       npm run db:migrateprod   # apply schema to the new DB
 *       npm run auth:seed-admin  # create the first admin user
 *
 *  8. That's it! You share the exact same codebase for every agency.
 *     To push a code update to all agencies, just update the shared code —
 *     each tenant's next build picks it up automatically.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Theme ───────────────────────────────────────────────────────────────────
// Replace these hex values with the agency's brand colours.
// primary-* : main CTA / link / highlight colour (e.g. brand blue, green, …)
// accent-*  : secondary highlight (e.g. orange badge, price tag, star)
// heroGradient: CSS gradient string used on the hero section background
export const theme = {
    colors: {
        primary: {
            50:  '#f0fdf4',   // very light tint  — swap for your brand
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',   // ← main brand colour
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
        },
        accent: {
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
        },
    },
    heroGradient: 'linear-gradient(135deg, #052e16 0%, #14532d 40%, #16a34a 100%)',
}

// ─── Site config ─────────────────────────────────────────────────────────────
const siteConfig = {
    // ─── Brand ───────────────────────────────────────────────────────────────
    /** Short public brand name shown in the nav bar, page title, etc. */
    name: 'Agency Name',
    /** Short tagline shown next to the name in some places. */
    tagline: 'Travel Packages',

    // ─── Metadata (client app) ───────────────────────────────────────────────
    fullTitle: 'Agency Name — Travel Packages',
    titleTemplate: '%s | Agency Name',
    description:
        'Discover curated travel packages with detailed routes, local tips, and everything you need for your trip.',
    /** Canonical public URL of the client app (no trailing slash). */
    url: 'https://example.com',

    // ─── Favicon / Icons ─────────────────────────────────────────────────────
    icons: {
        /** Path relative to client/public/ */
        favicon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },

    // ─── Admin app metadata ──────────────────────────────────────────────────
    admin: {
        title: 'Agency Admin',
        description: 'Admin dashboard for managing travel packages',
    },

    // ─── Social links ─────────────────────────────────────────────────────────
    social: {
        instagram: 'https://instagram.com/your-handle',
        twitter:   'https://twitter.com/your-handle',
        facebook:  'https://facebook.com/your-page',
    },

    // ─── Navigation ──────────────────────────────────────────────────────────
    nav: [
        { href: '/',        label: 'Home' },
        { href: '/guides',  label: 'Travel Packages' },
        { href: '/#about',  label: 'About Us' },
    ],

    // ─── Footer ──────────────────────────────────────────────────────────────
    footer: {
        description:
            'Curated travel packages with detailed routes, local tips, and all the information you need.',
        credit: 'Made with love for travellers.',
        links: {
            Explore: [
                { href: '/guides', label: 'Travel Packages' },
                { href: '/#about', label: 'About Us' },
            ],
            Help: [
                { href: '#contact', label: 'Contact' },
                { href: '#privacy', label: 'Privacy Policy' },
                { href: '#terms',   label: 'Terms of Service' },
            ],
        },
    },

    // ─── Theme (colours used by tailwind.config.ts) ──────────────────────────
    theme,
} as const

export default siteConfig
