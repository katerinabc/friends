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

        // const isImageUrl = (url: unknown): url is string =>
        //   typeof url === 'string' && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url);

        const items = casts.map((cast: any) => {
          const text = cast?.text || "";
          const author = cast?.author?.username || cast?.author?.display_name || "stranger";
          const timestamp = cast?.timestamp || "";

          // embeds: images

          // embeds: urls

          // embeds: mentions

          // likes, recasts, replies

          return {text, author, timestamp}
        });
        
        console.log('[API] /api/feeds url:', req.url, 'fid:', fid, 'items:', items.length);
        console.log('sample items', items[0], items[1])
        // console.log('sample images', (items[0]?.imageUrls || []).length, items[0]?.imageUrls);

        return Response.json({ items });
    } catch (error) {
        console.error('Error fetching feed:', error);
        return Response.json(
            { error: 'Failed to fetch feed'},
            { status: 500 }
        );
    }
}