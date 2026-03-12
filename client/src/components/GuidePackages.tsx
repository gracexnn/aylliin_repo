'use client'

import { useState } from 'react'
import type { PackageOption, DepartureSession } from '@/lib/types'
import { FiCalendar, FiCheckCircle, FiMap, FiStar, FiUsers, FiTag } from 'react-icons/fi'
import BookingModal from './BookingModal'

interface GuidePackagesProps {
    journeyOverview?: string | null
    packages?: PackageOption[] | null
    includedItems?: string[] | null
    attractionItems?: string[] | null
    departureSessions?: DepartureSession[]
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`;
}

function getSeatsLeft(session: DepartureSession) {
    return session.capacity - session.seats_booked
}

export default function GuidePackages({
    journeyOverview,
    packages,
    includedItems,
    attractionItems,
    departureSessions = [],
}: GuidePackagesProps) {
    const safeIncludedItems = includedItems ?? []
    const safeAttractionItems = attractionItems ?? []
    const [selectedSession, setSelectedSession] = useState<DepartureSession | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openBookingModal = (session: DepartureSession) => {
        setSelectedSession(session)
        setIsModalOpen(true)
    }

    const closeBookingModal = () => {
        setIsModalOpen(false)
        setSelectedSession(null)
    }

    if (
        !journeyOverview &&
        departureSessions.length === 0 &&
        safeIncludedItems.length === 0 &&
        safeAttractionItems.length === 0
    ) {
        return null
    }

    return (
        <section className="bg-white py-14 border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Journey Overview */}
                {journeyOverview && (
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                            <FiMap size={12} />
                            Аяллын тойм
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                            {journeyOverview}
                        </h2>
                    </div>
                )}

                {/* Available Departure Sessions */}
                {departureSessions.length > 0 && (
                    <div className="space-y-5">
                        <div>
                            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                                <FiCalendar size={12} />
                                Гарах хуваарь
                            </span>
                            <h3 className="text-xl font-bold text-gray-900">
                                Боломжит огноонууд
                            </h3>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                            {departureSessions.map((session) => {
                                const seatsLeft = getSeatsLeft(session)
                                const hasDiscount = session.discount_type && session.discount_value
                                const isLowSeats = seatsLeft < 5
                                
                                return (
                                    <div
                                        key={session.id}
                                        className="rounded-2xl bg-white border-2 border-gray-200 p-5 hover:border-primary-400 hover:shadow-md transition-all"
                                    >
                                        {/* Session Header */}
                                        <div className="mb-4">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-start gap-2 flex-1">
                                                    <FiCalendar className="text-primary-600 mt-0.5 shrink-0" size={18} />
                                                    <div className="flex-1">
                                                        <div className="text-lg text-gray-900 font-bold">
                                                            {session.label}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {formatDate(session.departure_date)}
                                                            {session.return_date && ` - ${formatDate(session.return_date)}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Public Note */}
                                            {session.public_note && (
                                                <div className="mt-2 text-sm text-gray-600 italic bg-gray-50 px-3 py-2 rounded-lg">
                                                    {session.public_note}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Price and Discount */}
                                        <div className="mb-4 pb-4 border-b border-gray-100">
                                            <div className="flex items-end justify-between gap-3">
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">Үнэ</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {session.currency} {session.final_price.toLocaleString()}
                                                    </div>
                                                    {hasDiscount && session.base_price !== session.final_price && (
                                                        <div className="text-sm text-gray-400 line-through mt-1">
                                                            {session.currency} {session.base_price.toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                                {hasDiscount && session.discount_reason && (
                                                    <div className="flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-full font-medium">
                                                        <FiTag size={11} />
                                                        <span>{session.discount_reason}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Seats and Book Button */}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <FiUsers className={isLowSeats ? 'text-orange-500' : 'text-gray-400'} size={16} />
                                                <span className={isLowSeats ? 'text-orange-600 font-semibold' : 'text-gray-600'}>
                                                    {seatsLeft} суудал үлдсэн
                                                </span>
                                            </div>
                                            
                                            <button
                                                onClick={() => openBookingModal(session)}
                                                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-full transition-colors"
                                            >
                                                Захиалах
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Included Items and Attractions */}
                {(safeIncludedItems.length > 0 || safeAttractionItems.length > 0) && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {safeIncludedItems.length > 0 && (
                            <div className="rounded-3xl bg-gray-50 border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Хөтөлбөрт багтсан зүйлс
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {safeIncludedItems.map((item, index) => (
                                        <div key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
                                            <FiCheckCircle className="text-primary-500 mt-0.5 shrink-0" size={14} />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {safeAttractionItems.length > 0 && (
                            <div className="rounded-3xl bg-amber-50 border border-amber-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Онцлох үзвэрүүд
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {safeAttractionItems.map((item, index) => (
                                        <span
                                            key={`${item}-${index}`}
                                            className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-3 py-2 text-sm text-gray-700"
                                        >
                                            <FiStar className="text-amber-500" size={13} />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {selectedSession && (
                <BookingModal
                    session={selectedSession}
                    isOpen={isModalOpen}
                    onClose={closeBookingModal}
                />
            )}
        </section>
    )
}
