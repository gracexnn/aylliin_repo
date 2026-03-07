import { z } from 'zod';

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
  published: z.boolean(),
});

export const CreatePostSchema = PostSchema.omit({ id: true });
export const UpdatePostSchema = PostSchema.partial().required({ id: true });

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
  interesting_fact: z.string().optional().nullable(),
  recommended_time_to_visit: z.string().max(200).optional().nullable(),
  images: z.array(z.string().url()).optional(),
});

export const CreateRoutePointSchema = RoutePointSchema.omit({ id: true });
export const UpdateRoutePointSchema = RoutePointSchema.partial().required({ id: true });

export type Post = z.infer<typeof PostSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type CreateRoute = z.infer<typeof CreateRouteSchema>;
export type RoutePoint = z.infer<typeof RoutePointSchema>;
export type CreateRoutePoint = z.infer<typeof CreateRoutePointSchema>;
export type UpdateRoutePoint = z.infer<typeof UpdateRoutePointSchema>;
