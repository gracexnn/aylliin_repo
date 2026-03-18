import { NextResponse } from 'next/server'

type ContactRequest = {
    name?: string
    email?: string
    phone?: string
    travelInterest?: string
    message?: string
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as ContactRequest

        const name = body.name?.trim() ?? ''
        const email = body.email?.trim() ?? ''
        const phone = body.phone?.trim() ?? ''
        const travelInterest = body.travelInterest?.trim() ?? ''
        const message = body.message?.trim() ?? ''

        if (!name || !email || !message) {
            return NextResponse.json(
                { message: 'Нэр, и-мэйл, зурвас талбарууд шаардлагатай.' },
                { status: 400 },
            )
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { message: 'И-мэйл хаягаа зөв форматаар оруулна уу.' },
                { status: 400 },
            )
        }

        const normalizedPayload = {
            name,
            email,
            phone,
            travelInterest,
            message,
            receivedAt: new Date().toISOString(),
        }

        console.info('Contact request received:', normalizedPayload)

        return NextResponse.json(
            { message: 'Таны хүсэлтийг хүлээн авлаа. Тун удахгүй холбогдох болно.' },
            { status: 200 },
        )
    } catch {
        return NextResponse.json(
            { message: 'Хүсэлт боловсруулах үед алдаа гарлаа. Дахин оролдоно уу.' },
            { status: 500 },
        )
    }
}