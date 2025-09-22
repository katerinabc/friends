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

        const isImageUrl = (url: unknown): url is string =>
          typeof url === 'string' && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);

        const items = casts.map((cast: any) => {
          const text = cast?.text || "";
          const author = cast?.author?.username || cast?.author?.display_name || "stranger";

          const embeds: any[] = Array.isArray(cast?.embeds) ? cast.embeds : [];

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

          const seen = new Set<string>();
          const imageUrls: string[] = [...uploadedImages, ...linkPreviewImages].filter((url) => {
            if (seen.has(url)) return false;
            seen.add(url);
            return true;
          });

          return imageUrls.length > 0 ? { text, author, imageUrls } : { text, author };
        });

        console.log('[API] /api/feeds url:', req.url, 'fid:', fid, 'items:', items.length);
        return Response.json({ items });
    } catch (error) {
        console.error('Error fetching feed:', error);
        return Response.json(
            { error: 'Failed to fetch feed'},
            { status: 500 }
        );
    }
}