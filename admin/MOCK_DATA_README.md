# Mock Data Seeding Guide

This guide explains how to populate your database with realistic mock data for development and testing.

## What Gets Created

The mock data seed script (`scripts/seed-mock-data.mjs`) creates a complete, realistic travel agency dataset:

### 📚 Content Library
- **7 Reusable Inclusions**: Tour guide, accommodation, meals, transportation, entrance fees, insurance, airport transfers
- **6 Reusable Highlights**: Small group experiences, cultural immersion, natural landscapes, wildlife, expert guides, flexible itinerary
- **6 Library Locations**: Gobi Desert, Khuvsgul Lake, Ulaanbaatar, Terelj National Park, Erdene Zuu Monastery, Khongoryn Els

### ✈️ Travel Guides
Three complete, published travel guides:
1. **Classic Gobi Desert Adventure** (7 days) - Highlighted tour with camel riding, sand dunes, and desert exploration
2. **Northern Mongolia Discovery** (10 days) - Highlighted tour featuring Khuvsgul Lake and reindeer herders
3. **Central Mongolia Explorer** (5 days) - Perfect introduction tour with national parks and monasteries

### 🗺️ Routes & Itineraries
- 3 detailed routes with GPS waypoints
- Multiple stops per route with transport modes (driving, walking, plane)
- Interesting facts and recommended visit times
- Day-by-day itineraries linked to destinations

### 📅 Departure Sessions
- 18 departure sessions across all tours
- Mix of statuses: OPEN, DRAFT
- Various pricing tiers and package options
- Some sessions with partial bookings
- Seasonal scheduling (April - October 2026)

### 📝 Bookings & Travelers
- 3 sample bookings with different statuses:
  - Confirmed couple booking (PAID)
  - Pending solo traveler (PARTIAL payment)
  - Confirmed family of 4 (PAID)
- 7 travelers with realistic details
- Unique booking codes

### 📊 Analytics
- 100 site visit records spanning last 30 days
- Various pages, referrers, and user agents

### 🏠 Landing Page
- Complete homepage configuration
- Hero section text and CTAs
- Contact information
- Social media links
- SEO metadata

## How to Run

### Prerequisites
1. Database must be set up and migrated:
   ```bash
   npm run db:migrate
   ```

2. Environment variables configured in `.env`:
   ```env
   DATABASE_URL="postgresql://..."
   ```

### Running the Seed

From the `admin` directory:

```bash
npm run db:seed
```

This will:
1. ⚠️ **Delete ALL existing data** (except admin users)
2. Create all library items (inclusions, highlights, locations)
3. Create travel guide posts with images
4. Link posts to library items
5. Create routes with detailed waypoints
6. Create departure sessions
7. Create sample bookings with travelers
8. Generate site visit analytics
9. Configure landing page settings

### First Time Setup

If this is your first time setting up the project:

```bash
# 1. Install dependencies
npm install

# 2. Run migrations
npm run db:migrate

# 3. Create admin user
npm run auth:seed-admin

# 4. Load mock data
npm run db:seed
```

### Admin User

Don't forget to create an admin user if you haven't already:

```bash
# Set environment variables:
# ADMIN_SEED_EMAIL=admin@example.com
# ADMIN_SEED_PASSWORD=your-password
# ADMIN_SEED_NAME=Admin User

npm run auth:seed-admin
```

## Customizing Mock Data

The seed script is located at `scripts/seed-mock-data.mjs`. You can modify it to:

- Add more tours/destinations
- Change pricing
- Adjust dates
- Add more bookings
- Modify text content
- Add different locations

### Example: Adding a New Tour

```javascript
const newPost = await prisma.post.create({
  data: {
    title: 'Your Tour Title',
    slug: 'your-tour-slug',
    cover_image: 'https://your-image-url.com',
    // ... other fields
  },
});
```

## Safety Notes

⚠️ **WARNING**: The seed script **DELETES EXISTING DATA** by default!

To preserve existing data, comment out the cleanup section:

```javascript
// ─── Clean existing data ────
// console.log('🧹 Cleaning existing data...');
// await prisma.traveler.deleteMany();
// ... etc
```

Alternatively, modify the script to only add data without deleting.

## Troubleshooting

### Database Connection Error
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

### Foreign Key Errors
- Make sure migrations are up to date: `npm run db:migrate`
- Check that Prisma schema matches your database

### Duplicate Data Errors
- The script cleans data by default
- If you've modified it to skip cleanup, ensure unique constraints won't be violated

## What's Next?

After seeding:

1. **Start the dev server**: `npm run dev`
2. **View the admin panel**: http://localhost:3000
3. **Check Prisma Studio**: `npm run db:studio` to browse the data
4. **Visit the client site**: Check how the data appears on the frontend

## Data Details

### Travel Guides Content
All guides include:
- Rich HTML content explaining the journey
- Package options with pricing
- Day-by-day itineraries
- Travel tips
- Linked inclusions and highlights
- Multiple images
- SEO-friendly slugs

### Realistic Pricing
- Prices in Mongolian Tugrik (MNT)
- Standard package: 1.1-2.9M MNT
- Comfort package: 2.5-3.7M MNT  
- Premium package: 1.9-3.3M MNT

### Locations
All library locations include:
- GPS coordinates (real Mongolia locations)
- Cover images (via Unsplash)
- Descriptions
- Regional categorization
- Tags for filtering

---

**Happy Testing! 🎉**
