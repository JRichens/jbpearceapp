import axios from 'axios'
import https from 'https'

type ApiResponse = {
    success: boolean
    message?: string
    error?: string
    details?: string // Stack trace for errors
}

// Configure axios for HTTPS with self-signed certificate
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Allow self-signed certificates in development
    }),
})

const API_BASE_URL = 'https://localhost:3000'

async function checkServerStatus(): Promise<boolean> {
    try {
        await axiosInstance.get(`${API_BASE_URL}/api/healthcheck`)
        return true
    } catch (error) {
        return false
    }
}

async function waitForServer(maxAttempts = 5): Promise<boolean> {
    console.log('Checking if Next.js server is running...')

    for (let i = 0; i < maxAttempts; i++) {
        if (await checkServerStatus()) {
            console.log('Server is running!')
            return true
        }

        if (i < maxAttempts - 1) {
            console.log(
                `Server not ready, waiting 5 seconds... (attempt ${
                    i + 1
                }/${maxAttempts})`
            )
            await new Promise((resolve) => setTimeout(resolve, 5000))
        }
    }

    return false
}

async function main() {
    try {
        // First check if the server is running
        const serverReady = await waitForServer()
        if (!serverReady) {
            throw new Error(
                'Next.js server is not running. Please start it with "npm run dev" first.'
            )
        }

        console.log('Starting eBay sold items check...')

        // Make request to our API endpoint
        const { data } = await axiosInstance.get<ApiResponse>(
            `${API_BASE_URL}/api/ebay-listings/check-sold`
        )

        if (!data.success) {
            console.error('\nAPI Error Details:')
            if (data.error) console.error('Error Message:', data.error)
            if (data.details) console.error('Stack Trace:', data.details)
            throw new Error(
                'Failed to check sold items. See error details above.'
            )
        }

        console.log('Success:', data.message)
    } catch (error) {
        console.error('\nError Details:')

        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED') {
                console.error(
                    'Connection Error: Could not connect to the server. Please ensure:'
                )
                console.error(
                    '1. The Next.js server is running ("npm run dev")'
                )
                console.error('2. The server is accessible at', API_BASE_URL)
            } else {
                console.error('Request Error:', error.message)
                if (error.response?.data) {
                    console.error('\nAPI Response:')
                    console.error('Status:', error.response.status)
                    console.error('Status Text:', error.response.statusText)
                    console.error(
                        'Data:',
                        JSON.stringify(error.response.data, null, 2)
                    )
                }
            }
        } else {
            console.error('Unexpected Error:', error)
        }

        console.error('\nTroubleshooting Steps:')
        console.error('1. Ensure the Next.js server is running with HTTPS')
        console.error(
            '2. Check that EBAY_USER_TOKEN is set in your environment'
        )
        console.error('3. Verify your eBay token has not expired')
        console.error('4. Check the server logs for more details')

        process.exit(1)
    }
}

// Ensure axios handles errors properly
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error)
    process.exit(1)
})

main()
