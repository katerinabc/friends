import axios from 'axios';
import { AxiosResponse } from 'axios';
import { ReciprocalResponse, ReciprocalFollower } from '../../../types/cast';

export class FetchReciprocals {
    private readonly apiKey: string;
    private readonly baseUrl: string = 'https://api.neynar.com/v2';
    private userId: number; 

    constructor(userId: number = 2) { //adding default value for userid for testing
        const apiKey = process.env.NEYNAR_API_KEY;
        if (!apiKey) {
            throw new Error('NEYNAR_API_KEY not found in environment variables. check again');
        }
        this.apiKey = apiKey;
        this.userId = userId;
    }

    /**
     * @returns Fetch a user's reciprocal followers
     */
    async getMutuals(): Promise<ReciprocalResponse> { // check this is correct type
    try {
        console.log('Neynar request fid:', this.userId);
        const response: AxiosResponse<ReciprocalResponse> = await axios.get(
            `${this.baseUrl}/farcaster/followers/reciprocal`, 
            {
                headers: {
                    'accept': 'application/json',
                    'x-api-key': this.apiKey
                },
                params: {
                    fid: this.userId,
                    sort_type: "desc_chron" //default is alogrithmic
                    // limit: 25, //25 is defualt anyway
                    // cursor: null,
            }
        });
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const data = error.response?.data;
            console.error('neynar error', status, data);
            throw new Error(`Neynar ${status}: ${JSON.stringify(data)}`);
        }
        throw error;
    }
}
}