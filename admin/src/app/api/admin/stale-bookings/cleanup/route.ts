/**
 * Stale Booking Cleanup Endpoint
 *
 * Cancels PENDING + UNPAID bookings that have exceeded the hold window and
 * releases their reserved seats back to the departure session.
 *
 * Designed to be called by an external cron job (e.g. Vercel Cron, GitHub Actions).
 * Protected by a Bearer token defined in the CLEANUP_SECRET environment variable.
 *
 * Hold window is controlled by the STALE_BOOKING_HOURS environment variable
 * (defaults to 24 hours).
 *
 * POST /api/admin/stale-bookings/cleanup
 * Authorization: Bearer <CLEANUP_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/client'

export async function POST(req: NextRequest) {
    // Verify bearer token
    const secret = process.env.CLEANUP_SECRET
    if (!secret) {
        return NextResponse.json(
            { error: 'Cleanup endpoint is not configured (CLEANUP_SECRET missing)' },
            { status: 503 }
        )
    }

    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cutoffHours = Math.max(1, parseInt(process.env.STALE_BOOKING_HOURS ?? '24', 10))
    const cutoffDate = new Date(Date.now() - cutoffHours * 60 * 60 * 1000)

    // Find all stale bookings (PENDING status + UNPAID + older than cutoff)
    const staleBookings = await prisma.booking.findMany({
        where: {
            booking_status: 'PENDING',
            payment_status: 'UNPAID',
            created_at: { lt: cutoffDate },
        },
        select: {
            id: true,
            booking_code: true,
            departure_session_id: true,
            passenger_count: true,
        },
    })

    if (staleBookings.length === 0) {
        return NextResponse.json({ cancelled: 0, message: 'No stale bookings found' })
    }

    let cancelled = 0
    const errors: string[] = []

    for (const booking of staleBookings) {
        try {
            await prisma.$transaction(async (tx) => {
                // Cancel the booking
                await tx.booking.update({
                    where: { id: booking.id },
                    data: { booking_status: 'CANCELLED' },
                })

                // Release reserved seats (guard against underflow)
                await tx.departureSession.updateMany({
                    where: {
                        id: booking.departure_session_id,
                        seats_booked: { gte: booking.passenger_count },
                    },
                    data: { seats_booked: { decrement: booking.passenger_count } },
                })

                // Re-open the session if it was FULL and now has available capacity
                const sessionAfterRelease = await tx.departureSession.findUnique({
                    where: { id: booking.departure_session_id },
                    select: { capacity: true, seats_booked: true, status: true },
                })
                if (
                    sessionAfterRelease &&
                    sessionAfterRelease.status === 'FULL' &&
                    sessionAfterRelease.seats_booked < sessionAfterRelease.capacity
                ) {
                    await tx.departureSession.update({
                        where: { id: booking.departure_session_id },
                        data: { status: 'OPEN' },
                    })
                }
            })
            cancelled++
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            errors.push(`booking ${booking.booking_code}: ${msg}`)
            console.error(`Failed to cancel stale booking ${booking.booking_code}:`, err)
        }
    }

    return NextResponse.json({
        cancelled,
        errors: errors.length > 0 ? errors : undefined,
        message: `Cancelled ${cancelled} of ${staleBookings.length} stale booking(s)`,
    })
}
