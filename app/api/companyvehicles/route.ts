import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET(request: NextRequest) {
    let browser
    try {
        // Launch the browser
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })

        const page = await browser.newPage()

        // Set a user agent to mimic a real browser
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        )

        // Navigate to the page
        await page.goto(
            'https://www.check-mot.service.gov.uk/results?registration=EJ58JUA&checkRecalls=false',
            {
                waitUntil: 'networkidle0',
            }
        )

        // Take a screenshot of the page
        await page.screenshot({ path: 'screenshot.png', fullPage: true })
        console.log('Screenshot taken and saved as screenshot.png')

        return NextResponse.json(
            { message: 'Screenshot taken successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error taking screenshot:', error)
        return NextResponse.json(
            { error: 'Failed to take screenshot' },
            { status: 500 }
        )
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}
