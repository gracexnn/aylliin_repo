/**
 * Public Booking API
 * Allows clients to create bookings with different payment methods
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/client'
import { z } from 'zod'
import { qpayService } from '@/lib/qpay'

// CORS headers for client access — origin is configurable via CLIENT_ORIGIN env var
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? (process.env.CLIENT_ORIGIN ?? 'https://aylal-client.vercel.app')
        : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

const TravelerInputSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email').or(z.literal('')).transform(val => val === '' ? null : val).nullable(),
    phone: z.string().min(1, 'Phone number is required'),
    passport_number: z.string().transform(val => val === '' ? null : val).nullable(),
    date_of_birth: z.string().transform(val => val === '' ? null : val).nullable(),
    nationality: z.string().transform(val => val === '' ? null : val).nullable(),
    emergency_contact: z.string().transform(val => val === '' ? null : val).nullable(),
    special_requirements: z.string().transform(val => val === '' ? null : val).nullable(),
})

const PublicBookingSchema = z.object({
    departure_session_id: z.string().min(1, 'Departure session is required'),
    payment_method: z.enum(['QPAY', 'CASH', 'UNPAID']),
    contact_name: z.string().min(1, 'Contact name is required'),
    contact_email: z.string().email('Valid email is required'),
    contact_phone: z.string().min(1, 'Phone number is required'),
    travelers: z.array(TravelerInputSchema).min(1, 'At least one traveler is required'),
    special_requests: z.string().transform(val => val === '' ? null : val).nullable(),
})

function generateBookingCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `BK${timestamp}${random}`
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const validatedData = PublicBookingSchema.parse(body)

        // Check if departure session exists and is available
        const session = await prisma.departureSession.findUnique({
            where: { id: validatedData.departure_session_id },
            include: {
                post: {
                    select: { id: true, title: true, slug: true }
                }
            }
        })

        if (!session) {
            return NextResponse.json({ error: 'Departure session not found' }, { status: 404, headers: corsHeaders })
        }

        if (session.status !== 'OPEN') {
            return NextResponse.json({ error: 'This departure session is not available for booking' }, { status: 400, headers: corsHeaders })
        }

        const seatsNeeded = validatedData.travelers.length
        // Initial availability check (optimistic, before transaction)
        const seatsAvailable = session.capacity - session.seats_booked

        if (seatsNeeded > seatsAvailable) {
            return NextResponse.json({ 
                error: `Only ${seatsAvailable} seat(s) available, but ${seatsNeeded} requested` 
            }, { status: 400, headers: corsHeaders })
        }

        // Generate unique booking code — retry on collision
        let bookingCode = generateBookingCode()
        let codeExists = await prisma.booking.findUnique({ where: { booking_code: bookingCode } })
        while (codeExists) {
            bookingCode = generateBookingCode()
            codeExists = await prisma.booking.findUnique({ where: { booking_code: bookingCode } })
        }

        const unitPrice = Number(session.final_price)
        const totalPrice = unitPrice * seatsNeeded

        // Map payment method to booking status
        let bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
        let paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL' | 'REFUNDED'

        switch (validatedData.payment_method) {
            case 'QPAY':
                bookingStatus = 'PENDING' // Will be confirmed after payment
                paymentStatus = 'UNPAID'
                break
            case 'CASH':
                bookingStatus = 'CONFIRMED' // Confirmed but will pay later
                paymentStatus = 'UNPAID'
                break
            case 'UNPAID':
                bookingStatus = 'PENDING' // Pre-registration without commitment
                paymentStatus = 'UNPAID'
                break
            default:
                bookingStatus = 'PENDING'
                paymentStatus = 'UNPAID'
        }

        // Create booking with transaction
        const booking = await prisma.$transaction(async (tx) => {
            // Re-check availability inside transaction to prevent overbooking race condition.
            // Use an atomic conditional updateMany: the WHERE clause checks seats_booked at
            // update time, so two concurrent transactions cannot both pass simultaneously.
            const currentSession = await tx.departureSession.findUnique({
                where: { id: validatedData.departure_session_id },
            })

            if (!currentSession || currentSession.status !== 'OPEN') {
                throw new Error('SESSION_UNAVAILABLE')
            }

            // Atomic seat reservation: increment only if enough seats remain
            const seatUpdate = await tx.departureSession.updateMany({
                where: {
                    id: validatedData.departure_session_id,
                    status: 'OPEN',
                    seats_booked: { lte: currentSession.capacity - seatsNeeded },
                },
                data: { seats_booked: { increment: seatsNeeded } },
            })

            if (seatUpdate.count === 0) {
                // Another concurrent request consumed the remaining seats
                const refetch = await tx.departureSession.findUnique({
                    where: { id: validatedData.departure_session_id },
                    select: { capacity: true, seats_booked: true },
                })
                const remaining = refetch ? refetch.capacity - refetch.seats_booked : 0
                throw new Error(`INSUFFICIENT_SEATS:${remaining}`)
            }

            const newBooking = await tx.booking.create({
                data: {
                    booking_code: bookingCode,
                    post_id: session.post_id,
                    departure_session_id: validatedData.departure_session_id,
                    contact_name: validatedData.contact_name,
                    contact_email: validatedData.contact_email,
                    contact_phone: validatedData.contact_phone,
                    passenger_count: seatsNeeded,
                    total_price_snapshot: totalPrice,
                    currency: session.currency,
                    booking_status: bookingStatus,
                    payment_status: paymentStatus,
                    source: 'client',
                    admin_note: [
                        `Payment Method: ${validatedData.payment_method}`,
                        validatedData.special_requests ? `Special Requests: ${validatedData.special_requests}` : null
                    ].filter(Boolean).join('\n'),
                    travelers: {
                        createMany: {
                            data: validatedData.travelers.map((traveler) => ({
                                full_name: `${traveler.first_name} ${traveler.last_name}`.trim(),
                                email: traveler.email,
                                phone: traveler.phone,
                                passport_number: traveler.passport_number,
                                date_of_birth: traveler.date_of_birth ? new Date(traveler.date_of_birth) : null,
                                nationality: traveler.nationality,
                                emergency_contact: traveler.emergency_contact,
                                special_request: traveler.special_requirements,
                            }))
                        }
                    }
                },
                include: {
                    travelers: true,
                    departure_session: {
                        include: {
                            post: {
                                select: { id: true, title: true, slug: true }
                            }
                        }
                    }
                }
            })

            // Auto-transition session to FULL if capacity is now reached
            await tx.departureSession.updateMany({
                where: {
                    id: validatedData.departure_session_id,
                    status: 'OPEN',
                    seats_booked: { gte: currentSession.capacity },
                },
                data: { status: 'FULL' },
            })

            return newBooking
        })

        // If payment method is QPAY, create invoice
        let qpayData = null
        if (validatedData.payment_method === 'QPAY') {
            try {
                const invoice = await qpayService.createInvoice({
                    amount: totalPrice,
                    description: `${session.post.title} - ${session.label} (${seatsNeeded} traveler${seatsNeeded > 1 ? 's' : ''})`,
                    bookingCode: bookingCode,
                })

                qpayData = {
                    invoice_id: invoice.invoice_id,
                    qr_text: invoice.qr_text,
                    qr_image: invoice.qr_image,
                    urls: invoice.urls,
                }

                // Store invoice ID in dedicated column for reliable retrieval
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { qpay_invoice_id: invoice.invoice_id }
                })
            } catch (error) {
                console.error('QPay invoice creation failed:', error)
                // Don't fail the booking, but return without payment info
                return NextResponse.json({
                    success: true,
                    booking: {
                        id: booking.id,
                        booking_code: bookingCode,
                        status: booking.booking_status,
                        payment_status: booking.payment_status,
                        total_price: totalPrice,
                    },
                    error: 'Booking created but payment gateway unavailable. Please contact us.',
                }, { status: 201, headers: corsHeaders })
            }
        }

        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                booking_code: bookingCode,
                status: booking.booking_status,
                payment_status: booking.payment_status,
                payment_method: validatedData.payment_method,
                total_price: totalPrice,
                passenger_count: seatsNeeded,
                contact_email: validatedData.contact_email,
                departure_session: {
                    label: session.label,
                    departure_date: session.departure_date,
                    return_date: session.return_date,
                    post: session.post,
                }
            },
            qpay: qpayData,
            message: 
                validatedData.payment_method === 'QPAY' 
                    ? 'Booking created! Please complete payment to confirm your reservation.'
                    : validatedData.payment_method === 'CASH'
                    ? 'Booking confirmed! You can pay in cash when we meet.'
                    : 'Pre-registration successful! We will contact you soon.'
        }, { status: 201, headers: corsHeaders })

    } catch (error) {
        console.error('Booking creation error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                error: 'Validation error', 
                details: error.issues 
            }, { status: 400, headers: corsHeaders })
        }

        if (error instanceof Error) {
            if (error.message === 'SESSION_UNAVAILABLE') {
                return NextResponse.json({
                    error: 'This departure session is not available for booking'
                }, { status: 400, headers: corsHeaders })
            }
            if (error.message.startsWith('INSUFFICIENT_SEATS:')) {
                const available = error.message.split(':')[1]
                return NextResponse.json({
                    error: `Only ${available} seat(s) available`
                }, { status: 400, headers: corsHeaders })
            }
        }

        return NextResponse.json({ 
            error: 'Failed to create booking',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500, headers: corsHeaders })
    }
}
