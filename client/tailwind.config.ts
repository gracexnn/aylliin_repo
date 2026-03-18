import type { Config } from 'tailwindcss'

const theme = {
    colors: {
        primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
        },
        accent: {
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
        },
    },
    heroGradient: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 40%, #0284c7 100%)',
}

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
