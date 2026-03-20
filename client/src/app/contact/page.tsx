import type { Metadata } from 'next'
import {
    FiClock,
    FiMail,
    FiMapPin,
    FiPhoneCall,
    FiZap,
} from 'react-icons/fi'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
    title: 'Холбоо барих',
    description: 'Aylal-ийн багтай холбогдож өөрт тохирсон аяллын төлөвлөгөөгөө эхлүүлээрэй.',
}

const contactHighlights = [
    {
        icon: FiPhoneCall,
        title: 'Утас',
        value: '+976 7700 9090',
        description: 'Даваа-Баасан 09:00-18:00',
    },
    {
        icon: FiMail,
        title: 'И-мэйл',
        value: 'hello@wenly.space',
        description: '24 цагийн дотор хариу илгээнэ',
    },
    {
        icon: FiMapPin,
        title: 'Хаяг',
        value: 'СБД, Улаанбаатар',
        description: 'Уулзалтын цагаа урьдчилан товлоорой',
    },
]

export default function ContactPage() {
    return (
        <>
            <Navbar />

            <main className="relative overflow-hidden bg-linear-to-b from-sky-50 via-white to-white pt-24 sm:pt-28">
                <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary-200/70 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-accent-400/25 blur-3xl" />

                <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
                    <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
                        <div>
                            <h1 className="mt-5 text-4xl font-black leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                                Бидэнтэй холбогдох
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                                Та аяллын хүсэлтээ бидэнд илгээхэд манай зөвлөх баг таны цаг, төсөв,
                                сонирхолд тохирсон багцыг санал болгож, төлөвлөлтийг нэг дор цэгцэлж өгнө.
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {contactHighlights.map(({ icon: Icon, title, value, description }) => (
                                    <article
                                        key={title}
                                        className="rounded-2xl border border-white bg-white/90 p-5 shadow-sm ring-1 ring-primary-100"
                                    >
                                        <div className="mb-4 inline-flex rounded-xl bg-primary-50 p-3 text-primary-700">
                                            <Icon size={18} />
                                        </div>
                                        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
                                            {title}
                                        </h2>
                                        <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
                                        <p className="mt-1 text-sm text-gray-600">{description}</p>
                                    </article>
                                ))}

                                <article className="rounded-2xl border border-accent-200 bg-accent-50/70 p-5 shadow-sm sm:col-span-2">
                                    <div className="mb-3 inline-flex rounded-xl bg-white/90 p-2.5 text-accent-600">
                                        <FiClock size={18} />
                                    </div>
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700">
                                        Хариу өгөх хугацаа
                                    </h2>
                                    <p className="mt-1 text-base font-semibold text-gray-900">
                                        Шинэ хүсэлтүүдэд ажлын өдрөөр 2-6 цагийн дотор хариу өгнө.
                                    </p>
                                </article>
                            </div>
                        </div>

                        <ContactForm />
                    </div>
                </section>
            </main>

            <Footer />
        </>
    )
}