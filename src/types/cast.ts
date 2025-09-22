// Types for API responses
export interface Author {
    object: 'user';
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    follower_count: number;
    following_count: number;
    profile?: {
        bio: {
            text: string;
            mentioned_profiles: any[];
        };
        location?: {
            latitude: number;
            longitude: number;
            address: {
                city: string;
                state: string;
                country: string;
                country_code: string;
            };
        };
    };
    verified_addresses?: {
        eth_addresses: string[];
        sol_addresses: string[];
    };
    verified_accounts: any[];
    power_badge: boolean;
}

export interface Cast {
    object: 'cast';
    hash: string;
    author: Author;
    text: string;
    timestamp: string;
    parent_author: {
        fid: number | null;
    };
    reactions: {
        likes_count: number;
        recasts_count: number;
        likes: Array<{
            fid: number;
            fname: string;
        }>;
    };
    replies: {
        count: number;
    };
    parent_url: string | null;
    root_parent_url: string | null;
    thread_hash: string;
    app?: {
        object: 'user_dehydrated';
        fid: number;
        username: string;
        display_name: string;
        pfp_url: string;
    };
    channel?: {
        object: 'channel_dehydrated';
        id: string;
        name: string;
        image_url: string;
    };
    mentioned_profiles: Array<{
        object: 'user';
        fid: number;
        username: string;
        custody_address: string;
        display_name: string;
        pfp_url: string;
        profile: {
            bio: {
                text: string;
                mentioned_profiles: any[];
            };
        };
        follower_count: number;
        following_count: number;
        verifications: string[];
        power_badge: boolean;
    }>;
    mentioned_profiles_ranges: Array<{
        start: number;
        end: number;
    }>;
    mentioned_channels: any[];
    mentioned_channels_ranges: any[];
}

export interface UserFeedResponse {
    casts: Cast[];
    next: {
        cursor?: string;
    };
} 