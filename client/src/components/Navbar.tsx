'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi'
import { MdExplore } from 'react-icons/md'
import siteConfig from '@/site.config'

const navLinks = siteConfig.nav

export default function Navbar() {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group"
                    >
                        <div
                            className={`p-1.5 rounded-lg transition-colors ${
                                scrolled
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white/20 text-white'
                            }`}
                        >
                            <MdExplore size={22} />
                        </div>
                        <span
                            className={`font-bold text-xl tracking-tight transition-colors ${
                                scrolled ? 'text-gray-900' : 'text-white'
                            }`}
                        >
                            {siteConfig.name}
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    pathname === link.href
                                        ? scrolled
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'bg-white/20 text-white'
                                        : scrolled
                                          ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                          : 'text-white/80 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/guides"
                            className={`ml-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                                scrolled
                                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                                    : 'bg-white text-primary-700 hover:bg-white/90 shadow-md'
                            }`}
                        >
                            Аяллаа эхлүүлэх
                        </Link>
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className={`md:hidden p-2 rounded-lg transition-colors ${
                            scrolled
                                ? 'text-gray-700 hover:bg-gray-100'
                                : 'text-white hover:bg-white/10'
                        }`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Цэс нээх"
                    >
                        {menuOpen ? <HiX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg rounded-b-2xl py-4 px-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    pathname === link.href
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/guides"
                            onClick={() => setMenuOpen(false)}
                            className="block mt-2 mx-4 px-5 py-3 bg-primary-600 text-white text-sm font-semibold rounded-full text-center hover:bg-primary-700"
                        >
                            Аяллаа эхлүүлэх
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}
