export type TransportMode =
    | 'WALKING'
    | 'DRIVING'
    | 'CYCLING'
    | 'BUS'
    | 'TRAIN'
    | 'TRAM'
    | 'SUBWAY'
    | 'BOAT'
    | 'FERRY'
    | 'PLANE'
    | 'HELICOPTER'

export type PackageDeparture = {
    id?: string
    label: string
    price: string
    secondary_price?: string | null
}

export type PackageOption = {
    id?: string
    title: string
    route_path: string
    duration_label: string
    departures: PackageDeparture[]
    notes: string[]
}

export type ItineraryDay = {
    id?: string
    day_number: number
    title: string
    route_label?: string | null
    description: string
    meals: string[]
    optional_extras: string[]
}

export type Post = {
    id: string
    title: string
    slug: string
    cover_image: string | null
    excerpt: string | null
    content: string | null
    journey_overview: string | null
    package_options: PackageOption[] | null
    included_items: string[]
    attraction_items: string[]
    itinerary_days: ItineraryDay[] | null
    travel_tips: string | null
    published: boolean
    highlighted: boolean
    created_at: string
    updated_at: string
}

export type RoutePoint = {
    id: string
    route_id: string
    order_index: number
    latitude: number
    longitude: number
    name: string
    description: string | null
    transport_type: TransportMode
    interesting_fact: string | null
    recommended_time_to_visit: string | null
    images: string[]
    day_number?: number | null
    created_at: string
}

export type Route = {
    id: string
    post_id: string
    title: string
    created_at: string
    points: RoutePoint[]
}

export type TravelGuide = {
    post: Post
    routes: Route[]
}

export type PostsResponse = {
    posts: Post[]
    total: number
    page: number
    limit: number
}

export type SessionStatus = 'DRAFT' | 'OPEN' | 'FULL' | 'CANCELLED'

export type DepartureSession = {
    id: string
    post_id: string
    package_option_id: string | null
    departure_date: string
    return_date: string | null
    label: string
    base_price: number
    currency: string
    discount_type: 'FIXED' | 'PERCENT' | null
    discount_value: number | null
    discount_reason: string | null
    final_price: number
    capacity: number
    seats_booked: number
    status: SessionStatus
    public_note: string | null
    internal_note: string | null
    created_at: string
    updated_at: string
}

export type DepartureSessionsResponse = {
    sessions: DepartureSession[]
    total: number
    page: number
    limit: number
}

export type TravelerInput = {
    first_name: string
    last_name: string
    email?: string | null
    phone: string
    passport_number?: string | null
    date_of_birth?: string | null
    nationality?: string | null
    emergency_contact?: string | null
    special_requirements?: string | null
}

export type PaymentMethod = 'QPAY' | 'CASH' | 'UNPAID'

export type CreateBookingRequest = {
    departure_session_id: string
    payment_method: PaymentMethod
    contact_name: string
    contact_email: string
    contact_phone: string
    travelers: TravelerInput[]
    special_requests?: string | null
}

export type QPayInvoice = {
    invoice_id: string
    qr_text: string
    qr_image: string
    urls: {
        name: string
        description: string
        logo: string
        link: string
    }[]
}

export type LandingSettings = {
    hero_title: string | null
    hero_subtitle: string | null
    hero_primary_cta_text: string | null
    hero_primary_cta_url: string | null
    hero_secondary_cta_text: string | null
    hero_secondary_cta_url: string | null
    contact_email: string | null
    contact_phone: string | null
    contact_address: string | null
    contact_whatsapp: string | null
    facebook_url: string | null
    instagram_url: string | null
    linkedin_url: string | null
    highlight_1_title: string | null
    highlight_1_description: string | null
    highlight_2_title: string | null
    highlight_2_description: string | null
    highlight_3_title: string | null
    highlight_3_description: string | null
    why_label: string | null
    why_heading: string | null
    why_body: string | null
    announcement_text: string | null
    footer_blurb: string | null
    meta_title: string | null
    meta_description: string | null
    og_image_url: string | null
    updated_at: string
}

export type BookingResponse = {
    success: boolean
    booking: {
        id: string
        booking_code: string
        status: string
        payment_status: string
        payment_method: string
        total_price: number
        passenger_count: number
        contact_email: string
        departure_session: {
            label: string
            departure_date: string
            return_date: string | null
            post: {
                id: string
                title: string
                slug: string
            }
        }
    }
    qpay?: QPayInvoice | null
    message: string
    error?: string
}
