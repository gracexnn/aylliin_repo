import { baseURL } from "@/resources";

export default function robots() {
  const allowIndexing = (process.env.ALLOW_INDEXING ?? process.env.NEXT_PUBLIC_ALLOW_INDEXING ?? '').toLowerCase() === 'true';

  return {
    rules: [
      allowIndexing
        ? {
            userAgent: "*",
            allow: "/",
          }
        : {
            userAgent: "*",
            disallow: "/",
          },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
