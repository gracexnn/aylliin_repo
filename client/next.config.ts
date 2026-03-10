import type { NextConfig } from 'next'

const ADMIN_API = process.env.ADMIN_API_URL ?? 'http://localhost:3000'

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${ADMIN_API}/api/:path*`,
            },
        ]
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },
}

export default nextConfig
