'use client'

import { useState, useEffect, useRef } from 'react'
import { FiArrowRight, FiMessageCircle } from 'react-icons/fi'
import type { DepartureSession } from '@/lib/types'
import BookingModal from '@/components/BookingModal'

interface TourStickyCTAProps {
    departureSessions: DepartureSession[]
    title: string
    whatsappNumber?: string | null
}

export default function TourStickyCTA({
    departureSessions,
    title,
    whatsappNumber,
}: TourStickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [selectedSession, setSelectedSession] = useState<DepartureSession | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showSessionPicker, setShowSessionPicker] = useState(false)
    const pickerRef = useRef<HTMLDivElement>(null)

    const cheapest = departureSessions.length > 0
        ? departureSessions.reduce(
              (min, s) => (s.final_price < min.final_price ? s : min),
              departureSessions[0],
          )
        : null

    /** Show bar after user scrolls past first screenful */
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > window.innerHeight * 0.6)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    /** Close session picker when clicking outside */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowSessionPicker(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleBookClick = () => {
        if (departureSessions.length === 0) return
        if (departureSessions.length === 1) {
            setSelectedSession(departureSessions[0])
            setIsModalOpen(true)
        } else {
            setShowSessionPicker((v) => !v)
        }
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return `${d.getMonth() + 1}/${d.getDate()}`
    }

    if (!isVisible) return null

    return (
        <>
            {/* Sticky bar — fixed to bottom on mobile, hidden on lg (sidebar handles it) */}
            <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
                {/* Session picker popover */}
                {showSessionPicker && (
                    <div
                        ref={pickerRef}
                        className="absolute bottom-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl max-h-72 overflow-y-auto"
                    >
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 border-b border-gray-100">
                            Огноо сонгоно уу
                        </p>
                        {departureSessions.map((session) => {
                            const seatsLeft = session.capacity - session.seats_booked
                            const isFull = seatsLeft <= 0 || session.status === 'FULL'
                            const isCancelled = session.status === 'CANCELLED'

                            return (
                                <button
                                    key={session.id}
                                    disabled={isFull || isCancelled}
                                    onClick={() => {
                                        setSelectedSession(session)
                                        setShowSessionPicker(false)
                                        setIsModalOpen(true)
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50 text-left transition-colors ${
                                        isFull || isCancelled
                                            ? 'opacity-40 cursor-not-allowed'
                                            : 'hover:bg-primary-50 active:bg-primary-100'
                                    }`}
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 leading-none mb-0.5">
                                            {session.label}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(session.departure_date)}
                                            {session.return_date && ` – ${formatDate(session.return_date)}`}
                                            {!isFull && !isCancelled && ` · ${seatsLeft} суудал`}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 shrink-0">
                                        {isCancelled ? 'Цуцлагдсан' : isFull ? 'Дүүрсэн' : `${session.currency} ${session.final_price.toLocaleString()}`}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Bar */}
                <div className="bg-white border-t border-gray-200 shadow-2xl px-4 py-3 flex items-center gap-3 safe-area-pb">
                    {cheapest && (
                        <div className="min-w-0">
                            <p className="text-[11px] text-gray-400 leading-none mb-0.5">Эхлэх үнэ</p>
                            <p className="text-base font-extrabold text-gray-900 leading-none truncate">
                                {cheapest.currency} {cheapest.final_price.toLocaleString()}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto shrink-0">
                        {whatsappNumber && (
                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 rounded-full border border-primary-300 text-primary-600 hover:bg-primary-50 transition-colors"
                                aria-label="WhatsApp"
                            >
                                <FiMessageCircle size={18} />
                            </a>
                        )}
                        <button
                            onClick={handleBookClick}
                            disabled={departureSessions.length === 0}
                            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold px-5 py-3 rounded-full transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Захиалах
                            <FiArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

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
        </>
    )
}
