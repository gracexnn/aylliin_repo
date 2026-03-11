/**
 * QPay Payment Callback Handler
 * Called by QPay when payment is completed
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/client'
import { qpayService } from '@/lib/qpay'

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://aylal-client.vercel.app',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const booking_code = req.nextUrl.searchParams.get('booking_code')

        console.log('QPay callback received:', { booking_code, body })

        if (!booking_code) {
            return NextResponse.json({ error: 'Booking code is required' }, { status: 400, headers: corsHeaders })
        }

        // Find the booking
        const booking = await prisma.booking.findUnique({
            where: { booking_code: booking_code },
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404, headers: corsHeaders })
        }

        // Extract invoice ID from booking notes
        const invoiceIdMatch = booking.admin_note?.match(/QPay Invoice ID: (.+)/)
        if (!invoiceIdMatch) {
            return NextResponse.json({ error: 'Invoice ID not found in booking' }, { status: 400, headers: corsHeaders })
        }

        const invoiceId = invoiceIdMatch[1]

        // Verify payment with QPay
        const isPaid = await qpayService.verifyPayment(invoiceId)

        if (isPaid) {
            // Update booking status
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    payment_status: 'PAID',
                    booking_status: 'CONFIRMED',
                    admin_note: `${booking.admin_note}\nPaid at: ${new Date().toISOString()}\nPayment confirmed via QPay callback`
                }
            })

            console.log(`Booking ${booking_code} payment confirmed`)

            return NextResponse.json({
                success: true,
                message: 'Payment confirmed and booking updated'
            }, { headers: corsHeaders })
        }

        return NextResponse.json({
            success: false,
            message: 'Payment not confirmed'
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('QPay callback error:', error)
        return NextResponse.json({ 
            error: 'Callback processing failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500, headers: corsHeaders })
    }
}

// Allow GET for testing
export async function GET(req: NextRequest) {
    const booking_code = req.nextUrl.searchParams.get('booking_code')

    if (!booking_code) {
        return NextResponse.json({ 
            message: 'QPay callback endpoint',
            usage: 'POST with booking_code query parameter'
        }, { headers: corsHeaders })
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { booking_code: booking_code },
            select: {
                booking_code: true,
                booking_status: true,
                payment_status: true,
                total_price_snapshot: true,
                currency: true,
                admin_note: true,
            }
        })

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404, headers: corsHeaders })
        }

        return NextResponse.json({ booking }, { headers: corsHeaders })
    } catch (error) {
        return NextResponse.json({ 
            error: 'Failed to fetch booking',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500, headers: corsHeaders })
    }
}
