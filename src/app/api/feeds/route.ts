// This is the HTTP endpoint your browser hits at /api/feeds. 
// Without it, the client fetch will fail regardless of Axios/TS/React.

//todo: fix images not showing up. Assume the whole API call is bullshit. 

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

          // Support multiple embed shapes from Neynar
          const embeds: any[] = Array.isArray(cast?.embeds)
            ? cast.embeds
            : Array.isArray((cast as any)?.embeds_dehydrated)
              ? (cast as any).embeds_dehydrated
              : [];

          // Broaden detection: consider url/source_url/image_url and open_graph fallbacks
          const candidateUrls: string[] = embeds
            .flatMap((e: any) => [
              e?.url,
              e?.source_url,
              e?.image_url,
              e?.metadata?.image,
              e?.metadata?.open_graph?.image,
              e?.open_graph?.image,
            ])
            .filter(isImageUrl);

          const uploadedImages: string[] = candidateUrls;
          const linkPreviewImages: string[] = [];

          const seen = new Set<string>();
          const imageUrls: string[] = [...uploadedImages, ...linkPreviewImages].filter((url) => {
            if (seen.has(url)) return false;
            seen.add(url);
            return true;
          });

          return imageUrls.length > 0 ? { text, author, imageUrls } : { text, author };
        });
        console.log('sample images', (items[0]?.imageUrls || []).length, items[0]?.imageUrls);

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