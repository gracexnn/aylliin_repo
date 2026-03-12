import type { RoutePoint, TransportMode } from './types'

export const TRANSPORT_VISUALS: Record<TransportMode, {
    color: string
    icon: string
    curve: number
    dash?: number[]
    width: number
    glow: number
    badge?: boolean
    label: string
}> = {
    WALKING:    { color: '#22c55e', icon: '🚶', curve: 0.04, width: 3, glow: 12, dash: [4, 6], label: 'Явган' },
    DRIVING:    { color: '#f97316', icon: '🚗', curve: 0.02, width: 3, glow: 12, label: 'Машин' },
    CYCLING:    { color: '#84cc16', icon: '🚴', curve: 0.03, width: 3, glow: 12, dash: [8, 5], label: 'Дугуй' },
    BUS:        { color: '#eab308', icon: '🚌', curve: 0.03, width: 3, glow: 12, dash: [10, 5], label: 'Автобус' },
    TRAIN:      { color: '#6366f1', icon: '🚂', curve: 0.07, width: 3, glow: 14, dash: [12, 4], label: 'Галт тэрэг' },
    TRAM:       { color: '#06b6d4', icon: '🚊', curve: 0.06, width: 3, glow: 14, dash: [10, 4], label: 'Трамвай' },
    SUBWAY:     { color: '#8b5cf6', icon: '🚇', curve: 0.05, width: 3, glow: 14, dash: [6, 4], label: 'Метро' },
    BOAT:       { color: '#3b82f6', icon: '⛵', curve: 0.16, width: 3, glow: 16, dash: [7, 7], badge: true, label: 'Завь' },
    FERRY:      { color: '#0ea5e9', icon: '⛴️', curve: 0.14, width: 3, glow: 16, dash: [9, 7], badge: true, label: 'Усан онгоц' },
    PLANE:      { color: '#ec4899', icon: '✈️', curve: 0.28, width: 3, glow: 18, dash: [12, 8], badge: true, label: 'Нислэг' },
    HELICOPTER: { color: '#f43f5e', icon: '🚁', curve: 0.22, width: 3, glow: 18, dash: [8, 8], badge: true, label: 'Нисдэг тэрэг' },
}

export const DAY_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b',
    '#10b981', '#6366f1', '#d946ef', '#84cc16',
]

export function getDayColor(dayNumber: number): string {
    return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length]
}

export function getTransportVisual(mode?: TransportMode) {
    return TRANSPORT_VISUALS[mode ?? 'WALKING']
}

export function getPointColor(point: RoutePoint): string {
    return getTransportVisual(point.transport_type).color
}

// Convert hex to rgb for rgba usage
export function hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
