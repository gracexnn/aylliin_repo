import type { Config } from 'tailwindcss'
import { theme } from './src/site.config'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        fontFamily: {
            sans: [
                'Inter',
                'ui-sans-serif',
                'system-ui',
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                'Arial',
                'sans-serif',
            ],
        },
        extend: {
            colors: theme.colors,
            backgroundImage: {
                'hero-gradient': theme.heroGradient,
            },
            typography: () => ({
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                    },
                },
            }),
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

export default config
