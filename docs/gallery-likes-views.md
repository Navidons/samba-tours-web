# Gallery Likes and Views Implementation

This document describes the implementation of likes and views functionality for the gallery system.

## Overview

The gallery now supports:
- **Likes**: Users can like/unlike gallery images
- **Views**: Automatic tracking of image views
- **Visitor Tracking**: Persistent visitor identification across sessions
- **Real-time Updates**: UI updates immediately when interactions occur

## Database Schema

### New Tables

#### `gallery_image_likes`
Tracks which visitors have liked which images.

```sql
CREATE TABLE `gallery_image_likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `visitor_id` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `imageId_visitorId` (`image_id`, `visitor_id`),
  FOREIGN KEY (`image_id`) REFERENCES `gallery_images` (`id`) ON DELETE CASCADE
);
```

#### `gallery_image_views`
Tracks image views by visitors (with 24-hour deduplication).

```sql
CREATE TABLE `gallery_image_views` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `visitor_id` varchar(255) NOT NULL,
  `viewed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`image_id`) REFERENCES `gallery_images` (`id`) ON DELETE CASCADE
);
```

### Updated Tables

#### `gallery_images`
Added relationships to tracking tables:
- `imageLikes`: One-to-many relationship with `gallery_image_likes`
- `imageViews`: One-to-many relationship with `gallery_image_views`

## API Endpoints

### Like/Unlike Image
```
POST /api/gallery/{imageId}/like
```

**Headers:**
- `Authorization: Bearer {visitorId}` (optional)

**Response:**
```json
{
  "success": true,
  "liked": true,
  "likes": 42
}
```

### Track Image View
```
POST /api/gallery/{imageId}/view
```

**Headers:**
- `Authorization: Bearer {visitorId}` (optional)

**Response:**
```json
{
  "success": true,
  "views": 156,
  "newView": true
}
```

## Visitor Tracking

### Visitor ID Generation
- Generated on first visit: `visitor_{timestamp}_{randomString}`
- Stored in localStorage and cookies for persistence
- Valid for 1 year

### Storage Methods
1. **localStorage**: Primary storage (client-side)
2. **Cookies**: Fallback storage (server-side accessible)
3. **Authorization Header**: For API requests

### Visitor ID Format
```
visitor_1703123456789_abc123def
```

## Frontend Implementation

### Gallery Grid Component
- Real-time like/unlike functionality
- Automatic view tracking on image click
- Optimistic UI updates
- Error handling for failed requests

### Key Features
- **Like Button**: Heart icon that fills when liked
- **View Counter**: Eye icon with view count
- **Real-time Updates**: Counts update immediately
- **Persistent State**: Likes remembered across sessions

### State Management
```typescript
const [likedImages, setLikedImages] = useState<Set<number>>(new Set())
const [imageStats, setImageStats] = useState<Record<number, { likes: number; views: number }>>({})
```

## Gallery Service

### Methods

#### `toggleImageLike(imageId: number)`
Toggles like status for an image.

#### `trackImageView(imageId: number)`
Tracks a view for an image (with deduplication).

#### `getVisitorId()`
Gets or generates a visitor ID.

## Security Considerations

### Rate Limiting
- Views are deduplicated per visitor per 24 hours
- Likes are unique per visitor per image
- No rate limiting implemented (consider adding for production)

### Data Privacy
- Visitor IDs are anonymous
- No personal information collected
- Data can be easily anonymized

### CSRF Protection
- Uses Authorization headers for API requests
- No CSRF tokens required (stateless API)

## Performance Optimizations

### Database Indexes
- `image_id` index on both tracking tables
- `visitor_id` index for quick lookups
- `created_at`/`viewed_at` indexes for time-based queries

### Caching Strategy
- No caching implemented (consider Redis for high-traffic sites)
- Real-time updates ensure data freshness

### Query Optimization
- Efficient foreign key relationships
- Minimal data transfer (only counts, not full records)

## Usage Examples

### Like an Image
```typescript
const result = await galleryService.toggleImageLike(imageId)
console.log(`Image ${result.liked ? 'liked' : 'unliked'}, total likes: ${result.likes}`)
```

### Track a View
```typescript
await galleryService.trackImageView(imageId)
// View count will be updated automatically
```

### Get Visitor Analytics
```typescript
import { getVisitorAnalytics } from '@/lib/visitor-tracking'

const analytics = getVisitorAnalytics()
console.log('Visitor ID:', analytics.visitorId)
console.log('Total page views:', analytics.totalPageViews)
```

## Migration

### Database Migration
Run the migration script to create the necessary tables:

```bash
# Option 1: Use Prisma
npx prisma db push

# Option 2: Run SQL directly
mysql -u username -p database_name < scripts/migrate-gallery-tracking.sql
```

### Code Migration
1. Update Prisma schema
2. Generate Prisma client
3. Deploy API endpoints
4. Update frontend components

## Testing

### Manual Testing
1. Visit gallery page
2. Click like button on an image
3. Verify like count increases
4. Click like button again
5. Verify like count decreases
6. Click on an image to open lightbox
7. Verify view count increases

### Automated Testing
Consider adding tests for:
- API endpoint functionality
- Visitor ID generation
- Like/unlike logic
- View tracking with deduplication
- Error handling

## Future Enhancements

### Potential Features
- **Like Notifications**: Notify photographers of new likes
- **Popular Images**: Sort by likes/views
- **Analytics Dashboard**: View engagement metrics
- **Social Sharing**: Share liked images
- **Collections**: Save liked images to collections

### Performance Improvements
- **Redis Caching**: Cache like/view counts
- **Background Jobs**: Process analytics in background
- **CDN Integration**: Serve images from CDN
- **Database Optimization**: Partition tables for large datasets

## Troubleshooting

### Common Issues

#### Likes Not Persisting
- Check visitor ID generation
- Verify localStorage/cookie storage
- Check API endpoint responses

#### View Counts Not Updating
- Verify 24-hour deduplication logic
- Check database constraints
- Review API error logs

#### Performance Issues
- Monitor database query performance
- Check for missing indexes
- Consider implementing caching

### Debug Tools
- Browser DevTools: Check localStorage and cookies
- Network Tab: Monitor API requests
- Database Logs: Check for errors
- Console Logs: Review error messages 