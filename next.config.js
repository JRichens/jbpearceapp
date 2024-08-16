const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
            {
                protocol: 'https',
                hostname: 'ws.carwebuk.com',
            },
            {
                protocol: 'https',
                hostname: 'utfs.io',
            },
        ],
    },
}

module.exports = withPWA(nextConfig)
