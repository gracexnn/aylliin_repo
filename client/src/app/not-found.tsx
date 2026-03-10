import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FiCompass } from 'react-icons/fi'

export default function NotFound() {
    return (
        <>
            <Navbar />
            <main className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-32">
                <div className="text-center px-4">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCompass size={32} className="text-primary-600" />
                    </div>
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-3">404</h1>
                    <p className="text-xl text-gray-500 mb-8">
                        Энэ хуудас эсвэл чиглэл олдсонгүй.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-all"
                    >
                        Нүүр рүү буцах
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    )
}
