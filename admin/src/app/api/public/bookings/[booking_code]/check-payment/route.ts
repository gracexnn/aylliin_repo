/**
 * Public API to check payment status
 * Allows clients to verify if their QPay payment has been completed
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/client'
import { qpayService } from '@/lib/qpay'

const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://aylal-client.vercel.app',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ booking_code: string }> }
) {
    try {
        const { booking_code } = await context.params

        // Find booking
        const booking = await prisma.booking.findUnique({
            where: { booking_code },
        })

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404, headers: corsHeaders }
            )
        }

        // If already paid, return success
        if (booking.payment_status === 'PAID') {
            return NextResponse.json(
                {
                    success: true,
                    paid: true,
                    booking: {
                        booking_code: booking.booking_code,
                        booking_status: booking.booking_status,
                        payment_status: booking.payment_status,
                    }
                },
                { headers: corsHeaders }
            )
        }

        // Extract invoice ID from admin_note
        const invoiceMatch = booking.admin_note?.match(/QPay Invoice ID: ([a-f0-9-]+)/)
        
        if (!invoiceMatch) {
            return NextResponse.json(
                {
                    success: true,
                    paid: false,
                    message: 'No QPay invoice found for this booking'
                },
                { headers: corsHeaders }
            )
        }

        const invoiceId = invoiceMatch[1]

        // Check payment with QPay
        const isPaid = await qpayService.verifyPayment(invoiceId)

        if (isPaid) {
            // Update booking status
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    payment_status: 'PAID',
                    booking_status: 'CONFIRMED',
                },
            })

            return NextResponse.json(
                {
                    success: true,
                    paid: true,
                    booking: {
                        booking_code: booking.booking_code,
                        booking_status: 'CONFIRMED',
                        payment_status: 'PAID',
                    }
                },
                { headers: corsHeaders }
            )
        }

        return NextResponse.json(
            {
                success: true,
                paid: false,
                message: 'Payment not yet completed'
            },
            { headers: corsHeaders }
        )

    } catch (error) {
        console.error('Check payment error:', error)
        return NextResponse.json(
            { error: 'Failed to check payment status' },
            { status: 500, headers: corsHeaders }
        )
    }
}
