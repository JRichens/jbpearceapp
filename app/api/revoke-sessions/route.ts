// app/api/revoke-sessions/route.ts
import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    console.log('Starting session revocation process...')

    try {
        let totalSessionsRevoked = 0
        let pageNumber = 1
        const limit = 100 // Adjust this value based on your needs

        while (true) {
            const users = await clerkClient.users.getUserList({
                limit,
                offset: (pageNumber - 1) * limit,
            })

            console.log(
                `Processing page ${pageNumber}: Found ${users.length} users`
            )

            if (users.length === 0) {
                break // No more users to process
            }

            for (const user of users) {
                console.log(`Processing user: ${user.id}`)

                let sessionPageNumber = 1
                while (true) {
                    const sessions = await clerkClient.sessions.getSessionList({
                        userId: user.id,
                        limit: limit as any, // Use type assertion to bypass the error
                        offset: (sessionPageNumber - 1) * limit,
                    } as any) // Use type assertion to bypass the error

                    console.log(
                        `User ${user.id} has ${sessions.length} active sessions on page ${sessionPageNumber}`
                    )

                    if (sessions.length === 0) {
                        break // No more sessions for this user
                    }

                    for (const session of sessions) {
                        await clerkClient.sessions.revokeSession(session.id)
                        totalSessionsRevoked++
                        console.log(
                            `Revoked session ${session.id} for user ${user.id}`
                        )
                    }

                    sessionPageNumber++
                }
            }

            pageNumber++
        }

        const message = `All sessions revoked successfully. Total sessions revoked: ${totalSessionsRevoked}`
        console.log(message)
        return NextResponse.json({ message }, { status: 200 })
    } catch (error) {
        console.error('Error revoking sessions:', error)
        return NextResponse.json(
            { error: 'Failed to revoke sessions' },
            { status: 500 }
        )
    }
}
