import Link from 'next/link'
import { MdExplore } from 'react-icons/md'
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi'
import siteConfig from '@/site.config'

const footerLinks = siteConfig.footer.links

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand col */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-primary-600 text-white">
                                <MdExplore size={22} />
                            </div>
                            <span className="font-bold text-xl text-white">{siteConfig.name}</span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                            {siteConfig.footer.description}
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            {(
                                [
                                    [FiInstagram, siteConfig.social.instagram],
                                    [FiTwitter, siteConfig.social.twitter],
                                    [FiFacebook, siteConfig.social.facebook],
                                ] as const
                            ).map(([Icon, href], i) => (
                                <a
                                    key={i}
                                    href={href}
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                                {category}
                            </h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. Бүх эрх хуулиар хамгаалагдсан.
                    </p>
                    <p className="text-xs text-gray-600">
                        {siteConfig.footer.credit}
                    </p>
                </div>
            </div>
        </footer>
    )
}
