// This is the HTTP endpoint your browser hits at /api/feeds. 
// Without it, the client fetch will fail regardless of Axios/TS/React.

import { FetchUserFeed } from "./UserFeed";

export async function GET(req: Request) {
    try {
        const { searchParams} = new URL(req.url);
        const fid = Number(searchParams.get('fid')) || 2;
        console.log('API /feeds fid:', fid);

        const service = new FetchUserFeed(fid);
        const casts = await service.getUserFeed();

        const first = casts[0];
        const text = first?.text || "";
        const author = first?.author?.username || first?.author?.display_name || "stranger";
        
        // Collect ALL image URLs, prioritizing cast-uploaded images over link-preview images.
        // Access via any since our local Cast type doesn't model embeds.
        const anyFirst = first as any;
        const embeds: any[] = Array.isArray(anyFirst?.embeds) ? anyFirst.embeds : [];

        const isImageUrl = (url: unknown): url is string =>
          typeof url === 'string' && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);

        const uploadedImages: string[] = embeds
          .filter((e: any) => {
            const contentType: string | undefined = e?.metadata?.content_type;
            const url: string | undefined = e?.url || e?.source_url;
            const isImageByType = typeof contentType === 'string' && contentType.startsWith('image');
            const isImageByExt = isImageUrl(url);
            return isImageByType || isImageByExt;
          })
          .map((e: any) => e?.url || e?.source_url)
          .filter(isImageUrl);

        const linkPreviewImages: string[] = embeds
          .map((e: any) => e?.metadata?.open_graph?.image)
          .filter(isImageUrl);

        // Combine with priority: uploaded first, then link previews. Deduplicate.
        const seen = new Set<string>();
        const imageUrls: string[] = [...uploadedImages, ...linkPreviewImages].filter((url) => {
          if (seen.has(url)) return false;
          seen.add(url);
          return true;
        });
        
        console.log('[API] /api/feeds url:', req.url, 'fid:', fid);

        if (imageUrls.length > 0) {
          return Response.json({ text, author, imageUrls });
        }
        return Response.json({ text, author });
    } catch (error) {
        console.error('Error fetching feed:', error);
        return Response.json(
            { error: 'Failed to fetch feed'},
            { status: 500 }
        );
    }
}