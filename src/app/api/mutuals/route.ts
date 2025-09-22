// This is the HTTP endpoint your browser hits at /api/feeds. 
// Without it, the client fetch will fail regardless of Axios/TS/React.

import { ReciprocalFollower } from "@/types/cast";
import { FetchReciprocals } from "./mutuals";

export async function GET(req: Request) {
    try {
        const { searchParams} = new URL(req.url);
        const fid = Number(searchParams.get('fid')) || 2;
        console.log('API /feeds fid:', fid);

        const service = new FetchReciprocals(fid);
        const mutuals = await service.getMutuals();

        console.log('[API] /api/feeds url:', req.url, 'fid:', fid);

        const items = mutuals.users.map((item: ReciprocalFollower) => {
            const user = item.user;
            return {
                fid: user.fid,
                username: user.username,
                displayname: user.display_name,
                bio: user.profile?.bio?.text ?? '',
                pfp: user.pfp_url
            };
            });
        return Response.json({ items })

    } catch (error) {
        console.error('Error fetching feed:', error);
        return Response.json(
            { error: 'Failed to fetch feed'},
            { status: 500 }
        );
    }
}