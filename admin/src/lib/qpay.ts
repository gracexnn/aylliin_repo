/**
 * QPay Payment Service
 * Handles QPay invoice creation and payment verification
 */

interface QPayAuthResponse {
    token_type: string
    refresh_expires_in: string
    refresh_token: string
    access_token: string
    expires_in: string
}

interface QPayInvoiceResponse {
    invoice_id: string
    qr_text: string
    qr_image: string
    qr_code: string
    urls: {
        name: string
        description: string
        logo: string
        link: string
    }[]
}

interface QPayPaymentResponse {
    object_type: string
    object_id: string
    amount: number
    payment_status: string
    payment_date: string
    payment_id: string
}

class QPayService {
    private baseUrl: string
    private username: string
    private password: string
    private invoiceCode: string
    private merchantId: string
    private callbackUrl: string
    private accessToken: string | null = null
    private tokenExpiry: number | null = null

    constructor() {
        this.baseUrl = process.env.QPAY_ENDPOINT || 'https://merchant-sandbox.qpay.mn/v2'
        this.username = process.env.QPAY_USERNAME || ''
        this.password = process.env.QPAY_PASSWORD || ''
        this.invoiceCode = process.env.QPAY_INVOICE_CODE || ''
        this.merchantId = process.env.QPAY_MERCHANT_ID || ''
        this.callbackUrl = process.env.QPAY_CALLBACK || ''
    }

    /**
     * Get authorization token from QPay
     */
    private async getToken(): Promise<string> {
        // Return cached token if still valid
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken
        }

        const response = await fetch(`${this.baseUrl}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
            },
        })

        if (!response.ok) {
            throw new Error(`QPay auth failed: ${response.statusText}`)
        }

        const data: QPayAuthResponse = await response.json()
        this.accessToken = data.access_token
        // Set expiry to 5 minutes before actual expiry for safety
        this.tokenExpiry = Date.now() + (parseInt(data.expires_in) - 300) * 1000

        return this.accessToken
    }

    /**
     * Create a QPay invoice for payment
     */
    async createInvoice({
        amount,
        description,
        bookingCode,
    }: {
        amount: number
        description: string
        bookingCode: string
    }): Promise<QPayInvoiceResponse> {
        const token = await this.getToken()

        const response = await fetch(`${this.baseUrl}/invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                invoice_code: this.invoiceCode,
                sender_invoice_no: bookingCode,
                invoice_receiver_code: bookingCode,
                invoice_description: description,
                amount: amount,
                callback_url: `${this.callbackUrl}?booking_code=${bookingCode}`,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`QPay invoice creation failed: ${error}`)
        }

        return await response.json()
    }

    /**
     * Check payment status for an invoice
     */
    async checkPayment(invoiceId: string): Promise<QPayPaymentResponse[]> {
        const token = await this.getToken()

        const response = await fetch(`${this.baseUrl}/payment/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                object_type: 'INVOICE',
                object_id: invoiceId,
            }),
        })

        if (!response.ok) {
            throw new Error(`QPay payment check failed: ${response.statusText}`)
        }

        const data = await response.json()
        return data.rows || []
    }

    /**
     * Verify if payment is completed
     */
    async verifyPayment(invoiceId: string): Promise<boolean> {
        const payments = await this.checkPayment(invoiceId)
        return payments.some(p => p.payment_status === 'PAID')
    }
}

// Export singleton instance
export const qpayService = new QPayService()
