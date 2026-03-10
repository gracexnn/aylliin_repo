import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'
import '@/app/globals.css'
import SiteVisitTracker from '@/components/site-visit-tracker'

export const metadata: Metadata = {
    title: {
        default: 'Aylal — Аяллын багц',
        template: '%s | Aylal',
    },
    description:
        'Дэлгэрэнгүй маршрут, орон нутгийн зөвлөгөө, хэрэгтэй мэдээлэл бүхий аяллын багцуудыг олж нээгээрэй.',
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
    openGraph: {
        siteName: 'Aylal',
        type: 'website',
    },
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="mn">
            <body>
                <Suspense fallback={null}>
                    <SiteVisitTracker />
                </Suspense>
                {children}
            </body>
        </html>
    )
}
