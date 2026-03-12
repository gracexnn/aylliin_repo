This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Admin access protection

Set these environment variables before running the admin app:

- `AUTH_SECRET` — long random secret for session signing
- `ADMIN_SEED_EMAIL` — email for the first admin account
- `ADMIN_SEED_PASSWORD` — password for the first admin account
- `ADMIN_SEED_NAME` — display name for the first admin account

See [.env.example](.env.example) for a starter template.

Then run the migration and seed the first admin user:

```bash
npm run db:migrate
npm run auth:seed-admin
```

## Landing Page Settings

Non-technical admins can edit key landing-page content from **Admin → Тохиргоо → Нүүр тохиргоо** without any code changes.

### Editable sections

| Section | Fields |
|---|---|
| **Hero** | Title, subtitle, primary CTA (text + URL), secondary CTA (text + URL) |
| **Contact** | Email, phone, address, WhatsApp |
| **Social** | Facebook URL, Instagram URL, LinkedIn URL |
| **Footer & Announcement** | Announcement banner text, footer blurb |
| **SEO** | Meta title, meta description, OG image URL |

### How changes propagate

1. Admin saves settings via `PUT /api/admin/landing-settings`.
2. Settings are stored as a single row in the `landing_page_settings` table (singleton pattern with a fixed UUID).
3. The client fetches the latest settings from the public endpoint `GET /api/public/landing-settings` on each server-render (revalidated every 5 minutes via Next.js ISR).
4. Changes appear on the public landing page within **≤5 minutes** of saving.

### Fallback behaviour

If no settings have been saved yet (fresh install), or a field is blank, the client automatically falls back to the defaults defined in `client/src/app/page.tsx` (`DEFAULTS`) and `client/src/site.config.ts`. The landing page will never break due to missing settings.

### Adding a new field

1. **Schema** — add the column to `model LandingPageSettings` in `admin/prisma/schema.prisma`.
2. **Migration** — create a new migration file under `admin/prisma/migrations/`.
3. **Zod** — add the field to `LandingSettingsSchema` in `admin/src/schemas/index.ts`.
4. **Client type** — add the field to `LandingSettings` in `client/src/lib/types.ts`.
5. **Admin UI** — add an input inside the relevant `SectionCard` in `admin/src/app/dashboard/landing-settings/page.tsx`.
6. **Client rendering** — read the new field in `client/src/app/page.tsx` (or whichever component needs it) with a fallback value.
7. Run `npx prisma generate` inside `admin/` after the schema change.

### API endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/landing-settings` | Required | Fetch current settings (admin use) |
| `PUT` | `/api/admin/landing-settings` | Required | Save / update settings |
| `GET` | `/api/public/landing-settings` | Public | Fetch settings for client rendering |

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
