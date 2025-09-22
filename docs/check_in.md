Summary: The mini app fetches a user's following feed and renders a Farcaster-style, image-first card list with multi-image horizontal scroll.

## Next tasks
- Add pagination (use Neynar cursor) to load more than 25 casts
- Create a setup screen for Inner and Outer Circle selection
- Enrich cards with counts: likes, recasts, replies (and maybe timestamps)
- Minor UX polish: skeleton loaders, error toasts, and better empty state

## What we've done so far
- Project converted to TypeScript for API/feed logic; cleaned up environment handling
- Implemented `/api/feeds` endpoint that fetches Neynar following feed by `fid`
- Normalized cast data in the API and returned up to 25 items
- Extracted images from casts, prioritizing uploaded images; included link previews as fallback
- Returned all images per cast via `imageUrls` array
- Built `FeedGenerator` to request `{ items }` and render a list of cards
- Designed cards to be image-first and optimized for multiple images with horizontal scroll
- Centered the feed column with a comfortable max width; removed auto-scroll jumps
- Added minimal, readable global CSS for the card look and small animations

## Notes
- The feed currently uses the authenticated Farcaster `fid` if available via the mini app context; otherwise a default
- The app is stable and renders the latest 25 casts; no pagination yet

