import axios from 'axios';
import { AxiosResponse } from 'axios';
// import dotenv from 'dotenv';
import { Cast, UserFeedResponse } from '../../../types/cast';

// dotenv.config();
//In Next.js API routes, env vars are read from process.env automatically. 
// Using dotenv can interfere under the dev server. Remove it.

export class FetchUserFeed {
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
     * @returns Fetch a user's following feed. Currently limited to default 25 casts
     */
    async getUserFeed(): Promise<Cast[]> {
    try {
        console.log('Neynar request fid:', this.userId);
        const response: AxiosResponse<UserFeedResponse> = await axios.get(
            `${this.baseUrl}/farcaster/feed/following`, 
            {
                headers: {
                    'accept': 'application/json',
                    'x-api-key': this.apiKey
                },
                params: {
                    fid: this.userId,
                    // limit: 25, //25 is defualt anyway
                    // cursor: null,
                    include_replies: true
            }
        });
        return response.data.casts;

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


// export async function GET() {
//     try {
//       const response = await fetch('https://www.sefaria.org/api/texts/random?titles=Esther%7CDaniel%7CJob%7CEzra%7CSamuel%7CRuth', {
//         headers: {
//           'accept': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch quote from Sefaria');
//       }
      
//       const data = await response.json();
      
//       // Clean up the text
//       let cleanText = data.text;
      
//       // Remove all HTML tags including sup, i, etc.
//       cleanText = cleanText.replace(/<[^>]*>/g, '');
      
//       // Remove footnote markers and their content
//       cleanText = cleanText.replace(/\s*\[\w+\]/g, ''); // Remove [a], [b], etc.
//       cleanText = cleanText.replace(/\s*-\w+$/g, ''); // Remove trailing -a, -b, etc.
      
//       // Clean up extra whitespace
//       cleanText = cleanText.replace(/\s+/g, ' ').trim();
      
//       // Return only the data we need
//       return Response.json({
//         text: cleanText,
//         ref: data.ref
//       });
//     } catch (error) {
//       console.error('Error fetching quote:', error);
//       return Response.json(
//         { error: 'Failed to fetch quote' },
//         { status: 500 }
//       );
//     }
//   }