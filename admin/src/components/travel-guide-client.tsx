'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MapComponent from './map-component';
import { formatDate } from '@/lib/utils';
import { MapPin, Clock, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface RoutePoint {
  id: string;
  order_index: number;
  latitude: number;
  longitude: number;
  name: string;
  description: string | null;
  interesting_fact: string | null;
  recommended_time_to_visit: string | null;
  images: string[];
}

interface Route {
  id: string;
  title: string;
  points: RoutePoint[];
}

interface Post {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  excerpt: string | null;
  content: string | null;
  created_at: string;
}

interface TravelGuideClientProps {
  post: Post;
  routes: Route[];
}

export default function TravelGuideClient({ post, routes }: TravelGuideClientProps) {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [expandedPoints, setExpandedPoints] = useState<Set<number>>(new Set());

  const allPoints = routes.flatMap((r) => r.points ?? []).sort((a, b) => a.order_index - b.order_index);

  const togglePoint = (index: number) => {
    setExpandedPoints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handlePointCardClick = (index: number) => {
    setSelectedPointIndex(index);
    togglePoint(index);
    document.getElementById('route-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-3xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-2xl font-semibold mt-5 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('> ')) return (
        <blockquote key={i} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
          {line.slice(2)}
        </blockquote>
      );
      if (line.startsWith('- ') || line.startsWith('* ')) return (
        <li key={i} className="ml-6 list-disc">{line.slice(2)}</li>
      );
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-lg leading-relaxed my-3">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {post.cover_image ? (
          <div className="relative h-[60vh] overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl font-bold mb-4"
              >
                {post.title}
              </motion.h1>
              {post.excerpt && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-xl text-white/90 max-w-2xl"
                >
                  {post.excerpt}
                </motion.p>
              )}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-white/70 mt-3"
              >
                {formatDate(post.created_at)}
              </motion.p>
            </div>
          </div>
        ) : (
          <div className="py-24 px-8 text-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl font-bold mb-4"
            >
              {post.title}
            </motion.h1>
            {post.excerpt && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/90 max-w-2xl mx-auto"
              >
                {post.excerpt}
              </motion.p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-white/70 mt-4"
            >
              {formatDate(post.created_at)}
            </motion.p>
          </div>
        )}
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {post.content && (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="prose prose-lg max-w-none mb-16"
          >
            {renderContent(post.content)}
          </motion.article>
        )}

        {allPoints.length > 0 && (
          <motion.div
            id="route-map"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-6">Аяллын маршрут</h2>
            {routes.map((route) => (
              <div key={route.id} className="mb-4">
                <Badge variant="outline" className="mb-3">{route.title}</Badge>
              </div>
            ))}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <MapComponent
                points={allPoints}
                selectedIndex={selectedPointIndex ?? undefined}
                onPointClick={(index) => {
                  setSelectedPointIndex(index);
                  togglePoint(index);
                }}
                height="500px"
              />
            </div>
          </motion.div>
        )}

        {allPoints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6">Маршрутын цэгүүд</h2>
            <div className="space-y-4">
              {allPoints.map((point, index) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPointIndex === index ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePointCardClick(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                              {point.name}
                            </h3>
                            {expandedPoints.has(index) ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>

                          {expandedPoints.has(index) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 space-y-3"
                            >
                              {point.description && (
                                <p className="text-muted-foreground">{point.description}</p>
                              )}
                              {point.interesting_fact && (
                                <div className="flex gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-md p-3">
                                  <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-amber-800 dark:text-amber-200">{point.interesting_fact}</p>
                                </div>
                              )}
                              {point.recommended_time_to_visit && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>Best time: {point.recommended_time_to_visit}</span>
                                </div>
                              )}
                              {point.images && point.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                  {point.images.map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative aspect-video rounded-md overflow-hidden">
                                      <Image src={img} alt={`${point.name} ${imgIdx + 1}`} fill className="object-cover" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
