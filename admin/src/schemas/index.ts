import { z } from 'zod';

export const PackageDepartureSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Departure label is required').max(300),
  price: z.string().min(1, 'Price is required').max(200),
  secondary_price: z.string().max(200).optional().nullable(),
});

export const PackageOptionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Package title is required').max(300),
  route_path: z.string().min(1, 'Route path is required').max(500),
  duration_label: z.string().min(1, 'Duration is required').max(200),
  departures: z.array(PackageDepartureSchema).default([]),
  notes: z.array(z.string().min(1).max(300)).default([]),
});

export const ItineraryDaySchema = z.object({
  id: z.string().optional(),
  day_number: z.number().int().min(1),
  title: z.string().min(1, 'Day title is required').max(300),
  route_label: z.string().max(300).optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  meals: z.array(z.string().min(1).max(100)).default([]),
  optional_extras: z.array(z.string().min(1).max(300)).default([]),
});

export const PostSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(500),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(500)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  cover_image: z.string().url().optional().nullable(),
  excerpt: z.string().max(1000).optional().nullable(),
  content: z.string().optional().nullable(),
  journey_overview: z.string().max(1000).optional().nullable(),
  package_options: z.array(PackageOptionSchema).default([]),
  included_items: z.array(z.string().min(1).max(200)).default([]),
  attraction_items: z.array(z.string().min(1).max(200)).default([]),
  itinerary_days: z.array(ItineraryDaySchema).default([]),
  travel_tips: z.string().optional().nullable(),
  published: z.boolean(),
  highlighted: z.boolean().default(false),
});

export const CreatePostSchema = PostSchema.omit({ id: true });
export const UpdatePostSchema = PostSchema.partial().required({ id: true });

export const TRANSPORT_MODES = [
  'WALKING',
  'DRIVING',
  'CYCLING',
  'BUS',
  'TRAIN',
  'TRAM',
  'SUBWAY',
  'BOAT',
  'FERRY',
  'PLANE',
  'HELICOPTER',
] as const;

export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const RouteSchema = z.object({
  id: z.string().uuid().optional(),
  post_id: z.string().uuid(),
  title: z.string().min(1, 'Route title is required').max(500),
});

export const CreateRouteSchema = RouteSchema.omit({ id: true });
export const UpdateRouteSchema = RouteSchema.partial().required({ id: true });

export const RoutePointSchema = z.object({
  id: z.string().uuid().optional(),
  route_id: z.string().uuid(),
  order_index: z.number().int().min(0),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  name: z.string().min(1, 'Point name is required').max(500),
  description: z.string().optional().nullable(),
  transport_type: z.enum(TRANSPORT_MODES).default('WALKING'),
  interesting_fact: z.string().optional().nullable(),
  recommended_time_to_visit: z.string().max(200).optional().nullable(),
  images: z.array(z.string().url()).optional(),
  day_number: z.number().int().min(1).optional().nullable(),
});

export const CreateRoutePointSchema = RoutePointSchema.omit({ id: true });
export const UpdateRoutePointSchema = RoutePointSchema.partial().required({ id: true });

export type Post = z.infer<typeof PostSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
export type PackageDeparture = z.infer<typeof PackageDepartureSchema>;
export type PackageOption = z.infer<typeof PackageOptionSchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

// DepartureSession schemas
export const SESSION_STATUSES = ['DRAFT', 'OPEN', 'FULL', 'CANCELLED'] as const;
export const DISCOUNT_TYPES = ['FIXED', 'PERCENT'] as const;

export const DepartureSessionSchema = z.object({
  id: z.string().uuid().optional(),
  post_id: z.string().uuid(),
  package_option_id: z.string().max(100).optional().nullable(),
  departure_date: z.coerce.date(),
  return_date: z.coerce.date().optional().nullable(),
  label: z.string().min(1, 'Label is required').max(300),
  base_price: z.coerce.number().min(0),
  currency: z.string().max(10).default('IDR'),
  discount_type: z.enum(DISCOUNT_TYPES).optional().nullable(),
  discount_value: z.coerce.number().min(0).optional().nullable(),
  discount_reason: z.string().max(500).optional().nullable(),
  final_price: z.coerce.number().min(0),
  capacity: z.coerce.number().int().min(0).default(0),
  seats_booked: z.coerce.number().int().min(0).default(0),
  status: z.enum(SESSION_STATUSES).default('DRAFT'),
  public_note: z.string().optional().nullable(),
  internal_note: z.string().optional().nullable(),
});

export const CreateDepartureSessionSchema = DepartureSessionSchema.omit({ 
  id: true, 
  seats_booked: true 
});

export const UpdateDepartureSessionSchema = DepartureSessionSchema.partial().required({ id: true });

export type DepartureSession = z.infer<typeof DepartureSessionSchema>;
export type CreateDepartureSession = z.infer<typeof CreateDepartureSessionSchema>;
export type UpdateDepartureSession = z.infer<typeof UpdateDepartureSessionSchema>;

// Booking schemas
export const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const;
export const PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'] as const;
export const BOOKING_SOURCES = ['admin', 'website', 'phone', 'facebook', 'whatsapp', 'email'] as const;

export const TravelerSchema = z.object({
  id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
  full_name: z.string().min(1, 'Full name is required').max(300),
  gender: z.string().max(20).optional().nullable(),
  date_of_birth: z.coerce.date().optional().nullable(),
  passport_number: z.string().max(100).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(300).optional().nullable().or(z.literal('')),
  emergency_contact: z.string().max(500).optional().nullable(),
  special_request: z.string().optional().nullable(),
});

export const BookingSchema = z.object({
  id: z.string().uuid().optional(),
  booking_code: z.string().max(50).optional(),
  post_id: z.string().uuid(),
  departure_session_id: z.string().uuid(),
  package_option_id: z.string().max(100).optional().nullable(),
  contact_name: z.string().min(1, 'Contact name is required').max(300),
  contact_phone: z.string().min(1, 'Contact phone is required').max(50),
  contact_email: z.string().email('Valid email is required').max(300),
  passenger_count: z.coerce.number().int().min(1, 'At least 1 passenger required'),
  total_price_snapshot: z.coerce.number().min(0),
  currency: z.string().max(10).default('IDR'),
  booking_status: z.enum(BOOKING_STATUSES).default('PENDING'),
  payment_status: z.enum(PAYMENT_STATUSES).default('UNPAID'),
  admin_note: z.string().optional().nullable(),
  source: z.enum(BOOKING_SOURCES).default('admin'),
  travelers: z.array(TravelerSchema).optional(),
});

export const CreateBookingSchema = BookingSchema.omit({ id: true, booking_code: true });
export const UpdateBookingSchema = BookingSchema.partial().required({ id: true });

export type Traveler = z.infer<typeof TravelerSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBooking = z.infer<typeof CreateBookingSchema>;
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>;

export type Route = z.infer<typeof RouteSchema>;
export type CreateRoute = z.infer<typeof CreateRouteSchema>;
export type RoutePoint = z.infer<typeof RoutePointSchema>;
export type CreateRoutePoint = z.infer<typeof CreateRoutePointSchema>;
export type UpdateRoutePoint = z.infer<typeof UpdateRoutePointSchema>;
