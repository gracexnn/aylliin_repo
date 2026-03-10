import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@/app/globals.css'

export const metadata: Metadata = {
    title: {
        default: 'Aylliin — Аяллын хөтөч',
        template: '%s | Aylliin',
    },
    description:
        'Дэлгэрэнгүй маршрут, орон нутгийн зөвлөгөө, хэрэгтэй мэдээлэл бүхий аяллын хөтөчүүдийг олж нээгээрэй.',
    openGraph: {
        siteName: 'Aylliin',
        type: 'website',
    },
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="mn">
            <body>{children}</body>
        </html>
    )
}
