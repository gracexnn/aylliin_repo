import type { Config } from 'tailwindcss'

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
            colors: {
                primary: {
                    50:  '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                accent: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                },
            },
            backgroundImage: {
                'hero-gradient':
                    'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #065f46 100%)',
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
