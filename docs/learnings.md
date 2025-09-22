# Learnings (#question/#solution)

- #question: Why were we only seeing a single cast?
  - #solution: The API route returned only the first item (casts[0]), and the UI stored a single currentFeed. We changed the API to return { items: [...] } and the UI to render a list.

- #question: How should we prioritize images in a cast?
  - #solution: Prefer cast-uploaded images from embeds first; if none, fall back to link preview open_graph.image. We return all images via imageUrls.

- #question: How do we show multiple images nicely?
  - #solution: Use a horizontally scrollable strip at the top of each card with overflow-x: auto, spacing, and snap alignment.

- #question: Do we need vertical auto-scroll after loading?
  - #solution: No. It caused jumpiness. We removed auto-scroll so users naturally scroll the column; added layout centering for readability.

- #question: Where does fid come from in the mini app?
  - #solution: From Farcaster mini app context (sdk.context). If unavailable, we fall back to a default.

- #question: Why TypeScript on the server/API?
  - #solution: Clearer types for Neynar responses, safer refactors, and easier normalization (e.g., imageUrls).

- #question: How can we load more than 25 casts later?
  - #solution: Use Neynar’s next.cursor for pagination; pass it through the API and fetch more on scroll or via a button.

Note by me: this is only from the most recent chat session. I need to do this either manually or don't close chat session (or every day). Manually should be best for learning. 

- #question: Why did TypeScript complain about ReciprocalFollower vs ReciprocalResponse in mutuals?
  - #solution: Neynar returns a top-level object with `users: ReciprocalFollower[]`, not an array of `Author`. The fix was to type the axios call and function return as `ReciprocalResponse` and then, in the API route, map over `mutuals.users` and read fields from `item.user`. Also ensure `sort_type` is a string (e.g., "desc_chron") or omit it.