/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActionsBodySizeLimit: '10mb',
    },
    images: {
        formats: ['image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'genuine-calf-newly.ngrok-free.app',
            },
            {
                protocol: 'https',
                hostname: 'ws.carwebuk.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config) => {
        config.externals = [...config.externals, 'canvas', 'jsdom']
        return config
    },
}

module.exports = nextConfig
