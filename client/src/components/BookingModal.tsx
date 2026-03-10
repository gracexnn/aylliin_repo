'use client'

import { useState } from 'react'
import { DepartureSession, TravelerInput, PaymentMethod, CreateBookingRequest } from '@/lib/types'
import { createBooking, checkPaymentStatus } from '@/lib/api'
import { FiX, FiPlus, FiMinus, FiUser, FiMail, FiPhone, FiCreditCard } from 'react-icons/fi'

interface BookingModalProps {
    session: DepartureSession
    isOpen: boolean
    onClose: () => void
}

export default function BookingModal({ session, isOpen, onClose }: BookingModalProps) {
    const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QPAY')
    const [contactName, setContactName] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [specialRequests, setSpecialRequests] = useState('')
    const [travelers, setTravelers] = useState<TravelerInput[]>([
        {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            passport_number: '',
            date_of_birth: '',
            nationality: '',
            emergency_contact: '',
            special_requirements: '',
        }
    ])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCheckingPayment, setIsCheckingPayment] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [bookingResult, setBookingResult] = useState<any>(null)

    if (!isOpen) return null

    const seatsLeft = session.capacity - session.seats_booked
    const totalPrice = session.final_price * travelers.length

    const addTraveler = () => {
        if (travelers.length >= seatsLeft) {
            alert(`Only ${seatsLeft} seats available`)
            return
        }
        setTravelers([...travelers, {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            passport_number: '',
            date_of_birth: '',
            nationality: '',
            emergency_contact: '',
            special_requirements: '',
        }])
    }

    const removeTraveler = (index: number) => {
        if (travelers.length === 1) return
        setTravelers(travelers.filter((_, i) => i !== index))
    }

    const updateTraveler = (index: number, field: keyof TravelerInput, value: string) => {
        const updated = [...travelers]
        updated[index] = { ...updated[index], [field]: value }
        setTravelers(updated)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const bookingData: CreateBookingRequest = {
                departure_session_id: session.id,
                payment_method: paymentMethod,
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                travelers: travelers,
                special_requests: specialRequests || null,
            }

            const result = await createBooking(bookingData)
            setBookingResult(result)

            if (result.qpay) {
                setStep('payment')
            } else {
                setStep('success')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Booking failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCheckPayment = async () => {
        if (!bookingResult?.booking?.booking_code) return
        
        setIsCheckingPayment(true)
        setError(null)

        try {
            const result = await checkPaymentStatus(bookingResult.booking.booking_code)
            
            if (result.paid) {
                // Update booking result with paid status
                setBookingResult({
                    ...bookingResult,
                    booking: {
                        ...bookingResult.booking,
                        payment_status: 'PAID',
                        booking_status: 'CONFIRMED',
                    },
                })
                setStep('success')
            } else {
                setError('Төлбөр хараахан хийгдээгүй байна. Төлбөр төлсний дараа дахин шалгана уу.')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check payment')
        } finally {
            setIsCheckingPayment(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Аялал захиалах</h2>
                        <p className="text-sm text-gray-600 mt-1">{session.label}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Payment Method Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                    Төлбөрийн хэлбэр
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('QPAY')}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                                            paymentMethod === 'QPAY'
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <FiCreditCard className="mx-auto mb-2" size={24} />
                                        <div className="text-sm font-semibold">QPay</div>
                                        <div className="text-xs text-gray-500">Онлайн төлбөр</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('CASH')}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                                            paymentMethod === 'CASH'
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <FiUser className="mx-auto mb-2" size={24} />
                                        <div className="text-sm font-semibold">Бэлэн</div>
                                        <div className="text-xs text-gray-500">Уулзахдаа төлнө</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('UNPAID')}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                                            paymentMethod === 'UNPAID'
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <FiMail className="mx-auto mb-2" size={24} />
                                        <div className="text-sm font-semibold">Урьдчилан</div>
                                        <div className="text-xs text-gray-500">Бүртгэл хийх</div>
                                    </button>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Холбоо барих мэдээлэл</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Нэр *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Овог нэр"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            И-мэйл хаяг *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Утасны дугаар *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="99001122"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Travelers */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Аялагчид ({travelers.length})
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addTraveler}
                                        disabled={travelers.length >= seatsLeft}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiPlus size={16} />
                                        Аялагч нэмэх
                                    </button>
                                </div>

                                {travelers.map((traveler, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-900">
                                                Аялагч #{index + 1} {index === 0 && '(Үндсэн холбоо барих хүн)'}
                                            </h4>
                                            {travelers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTraveler(index)}
                                                    className="text-red-600 hover:text-red-700 p-1"
                                                >
                                                    <FiMinus size={20} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Нэр *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={traveler.first_name}
                                                    onChange={(e) => updateTraveler(index, 'first_name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Овог *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={traveler.last_name}
                                                    onChange={(e) => updateTraveler(index, 'last_name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Утас *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={traveler.phone}
                                                    onChange={(e) => updateTraveler(index, 'phone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    И-мэйл (заавал биш)
                                                </label>
                                                <input
                                                    type="email"
                                                    value={traveler.email || ''}
                                                    onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Special Requests */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Тусгай хүсэлт (заавал биш)
                                </label>
                                <textarea
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Хоол хүнс, эрүүл мэндийн асуудал гэх мэт..."
                                />
                            </div>

                            {/* Price Summary */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                                    <span>Нийт үнэ ({travelers.length} хүн)</span>
                                    <span>{session.currency} {totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                                >
                                    Цуцлах
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Түр хүлээнэ үү...' : 'Захиалга өгөх'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'payment' && bookingResult?.qpay && (
                        <div className="text-center space-y-6">
                            <h3 className="text-xl font-bold text-gray-900">Төлбөр төлөх</h3>
                            <p className="text-gray-600">
                                Захиалгын код: <span className="font-mono font-bold">{bookingResult.booking.booking_code}</span>
                            </p>
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Нийт дүн:</span>
                                    <span className="font-bold text-lg text-gray-900">
                                        {session.currency} {(session.final_price * travelers.length).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Desktop: QR Code Only */}
                            <div className="hidden md:block">
                                <div className="flex justify-center">
                                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                                        <img 
                                            src={`data:image/png;base64,${bookingResult.qpay.qr_image}`} 
                                            alt="QPay QR Code"
                                            className="w-64 h-64 object-contain"
                                        />
                                        <p className="text-sm text-gray-600 mt-4">QR код уншуулж төлбөр төлнө үү</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile: Bank App Deeplinks + Collapsible QR */}
                            <div className="md:hidden space-y-4">
                                <div className="space-y-3">
                                    <p className="font-semibold text-gray-900">Апп сонгоно уу:</p>
                                    <div className='flex flex-wrap gap-2'>
                                    {bookingResult.qpay.urls.map((url: any, i: number) => (
                                        <a
                                            key={i}
                                            href={url.link}
                                            className="flex items-center"
                                        >
                                            {url.logo && (
                                                <img 
                                                    src={url.logo} 
                                                    alt={url.name}
                                                    className="w-12 h-12 object-contain  rounded-xl"
                                                />
                                            )}
                                        </a>
                                    ))}
                                    </div>
                                </div>

                                <details className="group">
                                    <summary className="cursor-pointer text-primary-600 font-medium py-2 list-none flex items-center justify-center gap-2">
                                        <span>QR код үзэх</span>
                                        <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="mt-4 flex justify-center">
                                        <img 
                                            src={`data:image/png;base64,${bookingResult.qpay.qr_image}`} 
                                            alt="QPay QR Code"
                                            className="w-56 h-56 object-contain border-4 border-gray-200 rounded-2xl"
                                        />
                                    </div>
                                </details>
                            </div>

                            {error && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCheckPayment}
                                    disabled={isCheckingPayment}
                                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCheckingPayment ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Шалгаж байна...</span>
                                        </>
                                    ) : (
                                        'Төлбөр шалгах'
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                                >
                                    Хаах
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && bookingResult && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Амжилттай!</h3>
                            <p className="text-gray-600">{bookingResult.message}</p>
                            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Захиалгын код:</span>
                                    <span className="font-mono font-bold">{bookingResult.booking.booking_code}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">И-мэйл хаяг:</span>
                                    <span className="font-medium">{bookingResult.booking.contact_email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Нийт дүн:</span>
                                    <span className="font-bold">{session.currency} {bookingResult.booking.total_price.toLocaleString()}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Та бидэнтэй {bookingResult.booking.contact_email} хаягаар холбогдож болно.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                            >
                                Хаах
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
