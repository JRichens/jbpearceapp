// Example Express server script to cleanup eBay photos
const axios = require('axios')
const cron = require('node-cron')
require('dotenv').config()

// Configuration
const config = {
    // Replace with your Next.js app URL
    apiUrl: 'https://your-nextjs-app.com/api/ebay-listings/cleanup-photos',
    // Use the UploadThing secret from environment variables
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
}

// Function to cleanup eBay photos
async function cleanupEbayPhotos() {
    if (!config.uploadthingSecret) {
        throw new Error('UPLOADTHING_SECRET environment variable is not set')
    }

    try {
        const response = await axios.delete(config.apiUrl, {
            headers: {
                'x-uploadthing-secret': config.uploadthingSecret,
            },
        })

        console.log('Cleanup successful:', response.data)
        return response.data
    } catch (error) {
        console.error('Cleanup failed:', error.response?.data || error.message)
        throw error
    }
}

// Schedule the cleanup to run at midnight every day
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled eBay photos cleanup...')
    try {
        await cleanupEbayPhotos()
    } catch (error) {
        console.error('Scheduled cleanup failed:', error)
    }
})

// Example usage in an Express server:
/*
const express = require('express');
const app = express();

// Manual trigger endpoint (optional)
app.post('/trigger-cleanup', async (req, res) => {
    try {
        const result = await cleanupEbayPhotos();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('eBay photos cleanup scheduled for midnight');
});
*/

// Required environment variables in .env file:
/*
UPLOADTHING_SECRET=your-uploadthing-secret
*/
