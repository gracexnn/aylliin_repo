'use client'

import { useState } from 'react'
import type { DepartureSession } from '@/lib/types'
import { FiArrowRight, FiCalendar, FiClock, FiMap, FiTag, FiUsers } from 'react-icons/fi'
import BookingModal from './BookingModal'

interface TourSidebarProps {
    departureSessions: DepartureSession[]
    itineraryDays?: number
    routeCount?: number
    totalPoints?: number
    attractionCount?: number
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('mn-MN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function getSeatsLeft(session: DepartureSession) {
    return session.capacity - session.seats_booked
}

export default function TourSidebar({
    departureSessions,
    itineraryDays = 0,
    routeCount = 0,
    totalPoints = 0,
    attractionCount = 0,
}: TourSidebarProps) {
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

    const cheapestSession =
        departureSessions.length > 0
            ? departureSessions.reduce(
                  (min, s) => (s.final_price < min.final_price ? s : min),
                  departureSessions[0],
              )
            : null

    const stats = [
        itineraryDays > 0 && { icon: FiClock, value: itineraryDays, label: 'өдөр' },
        routeCount > 0 && { icon: FiMap, value: routeCount, label: 'маршрут' },
        totalPoints > 0 && { icon: FiUsers, value: totalPoints, label: 'зогсоол' },
    ].filter(Boolean) as { icon: React.ElementType; value: number; label: string }[]

    return (
        <div className="space-y-4">
            {/* Price + Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {cheapestSession ? (
                    <div className="p-5 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                            Эхлэх үнэ
                        </p>
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-3xl font-bold text-gray-900">
                                {cheapestSession.currency}{' '}
                                {cheapestSession.final_price.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">нэг хүнд</p>
                    </div>
                ) : (
                    <div className="p-5 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                            Аяллын мэдээлэл
                        </p>
                    </div>
                )}

                {stats.length > 0 && (
                    <div
                        className={`grid divide-x divide-gray-100 ${
                            stats.length === 1
                                ? 'grid-cols-1'
                                : stats.length === 2
                                  ? 'grid-cols-2'
                                  : 'grid-cols-3'
                        }`}
                    >
                        {stats.map(({ icon: Icon, value, label }) => (
                            <div key={label} className="flex flex-col items-center py-4 px-2">
                                <Icon size={14} className="text-primary-500 mb-1" />
                                <span className="text-xl font-bold text-gray-900">{value}</span>
                                <span className="text-xs text-gray-400 mt-0.5">{label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Departure Sessions */}
            {departureSessions.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 px-1">Гарах хуваарь</h3>
                    <div className="space-y-3">
                        {departureSessions.map((session) => {
                            const seatsLeft = getSeatsLeft(session)
                            const hasDiscount = session.discount_type && session.discount_value
                            const isLowSeats = seatsLeft > 0 && seatsLeft < 5
                            const isFull = seatsLeft <= 0 || session.status === 'FULL'
                            const isCancelled = session.status === 'CANCELLED'

                            return (
                                <div
                                    key={session.id}
                                    className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-primary-200 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                {session.label}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                                <FiCalendar size={11} />
                                                <span>
                                                    {formatDate(session.departure_date)}
                                                    {session.return_date &&
                                                        ` – ${formatDate(session.return_date)}`}
                                                </span>
                                            </div>
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

                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-gray-900 text-base">
                                                {session.currency}{' '}
                                                {session.final_price.toLocaleString()}
                                            </p>
                                            {hasDiscount &&
                                                session.base_price !== session.final_price && (
                                                    <p className="text-xs text-gray-400 line-through">
                                                        {session.currency}{' '}
                                                        {session.base_price.toLocaleString()}
                                                    </p>
                                                )}
                                        </div>

                                        <div className="flex flex-col items-end gap-1.5">
                                            {!isFull && !isCancelled && (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <FiUsers
                                                        size={11}
                                                        className={
                                                            isLowSeats
                                                                ? 'text-orange-500'
                                                                : 'text-gray-400'
                                                        }
                                                    />
                                                    <span
                                                        className={
                                                            isLowSeats
                                                                ? 'text-orange-600 font-medium'
                                                                : 'text-gray-500'
                                                        }
                                                    >
                                                        {seatsLeft} суудал
                                                    </span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() =>
                                                    !isFull &&
                                                    !isCancelled &&
                                                    openBookingModal(session)
                                                }
                                                disabled={isFull || isCancelled}
                                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                                                    isFull || isCancelled
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                                                }`}
                                            >
                                                {isCancelled
                                                    ? 'Цуцлагдсан'
                                                    : isFull
                                                      ? 'Дүүрсэн'
                                                      : 'Захиалах'}
                                                {!isFull && !isCancelled && (
                                                    <FiArrowRight size={11} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {departureSessions.length === 0 && attractionCount === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                    <p className="text-sm text-gray-400">
                        Гарах хуваарь удахгүй нэмэгдэнэ.
                    </p>
                </div>
            )}

            {selectedSession && (
                <BookingModal
                    session={selectedSession}
                    isOpen={isModalOpen}
                    onClose={closeBookingModal}
                />
            )}
        </div>
    )
}
