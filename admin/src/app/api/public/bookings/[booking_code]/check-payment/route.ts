/**
 * Public API to check payment status
 * Allows clients to verify if their QPay payment has been completed
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/client'
import { qpayService } from '@/lib/qpay'

const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? (process.env.CLIENT_ORIGIN ?? 'https://aylal-client.vercel.app')
        : '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

/**
 * Fallback parser for legacy bookings where the QPay invoice ID
 * is stored only in the admin_note field.
 */
function extractQpayInvoiceIdFromAdminNote(
    adminNote?: string | null
): string | null {
    if (!adminNote) {
        return null
    }

    // Example patterns handled:
    // "QPay invoice: <ID>", "QPay invoice-<ID>", etc.
    const match = adminNote.match(
        /qpay\s*invoice\s*[:\-]?\s*([A-Za-z0-9_-]+)/i
    )

    return match ? match[1] : null
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

        // Prefer dedicated qpay_invoice_id column, but fall back to parsing admin_note
        let invoiceId = booking.qpay_invoice_id as string | null

        if (!invoiceId) {
            invoiceId = extractQpayInvoiceIdFromAdminNote(booking.admin_note)
        }
        
        if (!invoiceId) {
            return NextResponse.json(
                {
                    success: true,
                    paid: false,
                    message: 'No QPay invoice found for this booking'
                },
                { headers: corsHeaders }
            )
        }

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
