import Link from 'next/link';
import { FeedGenerator } from '@/components/FeedGenerator';

export const metadata = {
  title: 'My Friends Feed',
  description: 'Seeing only what my friends are up to',
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: "link-to-a-3:2-preview-image", //  recommended200x200px image.
      button: {
        title: "Love them all",
        action: {
          type: "launch_frame",
          name: "see-my-friends",
          url: "your-app-url",
          splashImageUrl: "your-splash-image-url",
          splashBackgroundColor: "#1a1625"
        }
      }
    })
  }
};
// fix formating of nav bar. now both links right after another
export default function Home() {
  return (
    <main>
      <nav style={{ marginTop: 12 }}> 
          <Link href="/circle">Set up Friends</Link>
          <Link href="/intuition">Upload your Intuition</Link>
      </nav>
      <FeedGenerator />
      </main>
  );
}