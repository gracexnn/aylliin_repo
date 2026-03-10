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
