import axios from 'axios';
import { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { Cast, FetchSingleCast, ThreadSummaryResponse, UserFeedResponse } from './types';

dotenv.config();

export async function GET() {
    try {
        const response = await fetch('NEYNAR API URL', {
            headers: {
                'accept': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching feed:', error);
        return Response.json(
            { error: 'Failed to fetch feed' },
            { status: 500 }
        );
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