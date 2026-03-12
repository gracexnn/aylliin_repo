'use client'

import { useState } from 'react'
import { FiCalendar, FiUsers, FiTag, FiMessageCircle, FiArrowRight } from 'react-icons/fi'
import type { DepartureSession } from '@/lib/types'
import BookingModal from '@/components/BookingModal'

interface TourPricingCTAProps {
    departureSessions: DepartureSession[]
    whatsappNumber?: string | null
    title?: string
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`
}

export default function TourPricingCTA({
    departureSessions,
    whatsappNumber,
    title = 'Энэ аяллыг захиалах',
}: TourPricingCTAProps) {
    const [selectedSession, setSelectedSession] = useState<DepartureSession | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = (session: DepartureSession) => {
        setSelectedSession(session)
        setIsModalOpen(true)
    }

    const cheapestSession = departureSessions.length > 0
        ? departureSessions.reduce(
              (min, s) => (s.final_price < min.final_price ? s : min),
              departureSessions[0],
          )
        : null

    return (
        <section id="pricing" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-1">
                        Захиалга
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                {cheapestSession && (
                    <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-400 mb-0.5">Эхлэх үнэ</p>
                        <p className="text-3xl font-extrabold text-gray-900">
                            {cheapestSession.currency}{' '}
                            {cheapestSession.final_price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">нэг хүнд</p>
                    </div>
                )}
            </div>

            {/* Session cards */}
            {departureSessions.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {departureSessions.map((session) => {
                        const seatsLeft = session.capacity - session.seats_booked
                        const isFull = seatsLeft <= 0 || session.status === 'FULL'
                        const isCancelled = session.status === 'CANCELLED'
                        const isLow = seatsLeft > 0 && seatsLeft < 5
                        const hasDiscount = session.discount_type && session.discount_value

                        return (
                            <div
                                key={session.id}
                                className={`rounded-2xl border-2 p-5 transition-all ${
                                    isFull || isCancelled
                                        ? 'border-gray-100 bg-gray-50 opacity-60'
                                        : 'border-gray-200 hover:border-primary-400 hover:shadow-md cursor-pointer'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{session.label}</p>
                                        <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                            <FiCalendar size={11} />
                                            {formatDate(session.departure_date)}
                                            {session.return_date &&
                                                ` – ${formatDate(session.return_date)}`}
                                        </p>
                                    </div>
                                    {hasDiscount && session.discount_reason && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium shrink-0">
                                            <FiTag size={10} />
                                            {session.discount_reason}
                                        </span>
                                    )}
                                </div>

                                {session.public_note && (
                                    <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2 mb-3">
                                        {session.public_note}
                                    </p>
                                )}

                                <div className="flex items-center justify-between gap-3 mt-4">
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {session.currency} {session.final_price.toLocaleString()}
                                        </p>
                                        {hasDiscount && session.base_price !== session.final_price && (
                                            <p className="text-xs text-gray-400 line-through">
                                                {session.currency} {session.base_price.toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        {!isFull && !isCancelled && isLow && (
                                            <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                                <FiUsers size={11} />
                                                {seatsLeft} суудал үлдсэн
                                            </span>
                                        )}
                                        <button
                                            onClick={() => !isFull && !isCancelled && openModal(session)}
                                            disabled={isFull || isCancelled}
                                            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                                                isFull || isCancelled
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                                            }`}
                                        >
                                            {isCancelled
                                                ? 'Цуцлагдсан'
                                                : isFull
                                                  ? 'Дүүрсэн'
                                                  : 'Захиалах'}
                                            {!isFull && !isCancelled && <FiArrowRight size={13} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                /* No sessions — show inquiry prompt */
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-500 mb-4">Одоогоор нээлттэй хуваарь байхгүй байна.</p>
                    {whatsappNumber && (
                        <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
                        >
                            <FiMessageCircle size={16} />
                            WhatsApp-аар холбогдох
                        </a>
                    )}
                </div>
            )}

            {/* Secondary CTA — contact/WhatsApp */}
            {whatsappNumber && departureSessions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">Асуулт байна уу? Шууд холбогдоорой.</p>
                    <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-primary-300 text-primary-700 hover:bg-primary-50 font-medium px-5 py-2.5 rounded-full transition-colors text-sm"
                    >
                        <FiMessageCircle size={15} />
                        Мэргэжилтэнтэй ярих
                    </a>
                </div>
            )}

            {/* Booking modal */}
            {selectedSession && (
                <BookingModal
                    session={selectedSession}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedSession(null)
                    }}
                />
            )}
        </section>
    )
}
