'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useRef } from 'react';


type Feed = { text: string; author: string; imageUrls?: string[] }

export function FeedGenerator() {
  const [currentFeed, setCurrentFeed] = useState<Feed | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [fid, setFid] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null); // for auto-scroll

  const fetchFeed = async (url?: string) => {
    setIsLoading(true);
    setIsAnimating(true);
    // const f = (typeof window !== 'undefined' && (window as any).userFid) ?? fid;
    // const url = f ? `/api/feeds?fid=${f}` : '/api/feeds';
    console.log('GET', url);
    
    try {
      const response = await fetch(url ?? '/api/feeds'); 
      
      
      if (!response.ok) {
        throw new Error('Failed to fetch following feed');
      }
      
      const data = await response.json();
      console.log('neynar response', data)

      setCurrentFeed({ text: data.text, author: data.author, imageUrls: data.imageUrls })
      setIsAnimating(false); //what does this do?
      setIsLoading(false); //what does this do?
      
      // setTimeout(() => {
      //   setCurrentFeed({
      //     text: data.text,
      //     author: data.author
      //   });
      //   // containerRef.current?.scrollIntoView({behavior: 'smooth'});
        
      // }, 300);
    } catch (error) {
      console.error('Error fetching feed:', error);
      setIsLoading(false);
      setIsAnimating(false);
    }
  };

  // get user context (fid) from farcaster app if user authenticated
  useEffect(() => {
    
    (async () => { 
    
    // Get user context from Farcaster
    const getUser = async () => {
      try {
        const context = await sdk.context;
        if (context && context.user) {
          setUsername(context.user.username || context.user.displayName || 'friend');
          setFid(context.user.fid);
        }
      } catch (error) {
        console.log('Not in Farcaster context');
      }
    };
    await getUser();
    })();

  }, []);

  // Fetch feed when fid is ready (available)
  useEffect(() => {

    if (fid == null) return; //exists effect early until fid is set
    const url = `/api/feeds?fid=${fid}`;
    fetchFeed(url);
  }, [fid]);

  // scroll after feed is set to see more data. runs when currentFeed changes
  useEffect(() => {
    if (!currentFeed) return; // exists effect early when no currentFeed
    containerRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [currentFeed])

  if (!currentFeed && !isLoading) return "nothing is happening here";

  return (
    <div ref={containerRef} className={`feed-container ${!isAnimating ? 'fade-in' : ''}`}>
      {username && (
        <>
          <h1 className="greeting">Hi, {username}</h1>
          <p className="subheading">Here's your quote:</p>
        </>
      )}

      {isLoading ? (
        <p className="feed-text">Loading...</p>
      ) : currentFeed ? (
        <article className="feed-card">
          {currentFeed.imageUrls && currentFeed.imageUrls.length > 0 ? (
            <div className="feed-images-scroll" role="region" aria-label="cast images">
              {currentFeed.imageUrls.map((url, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={`${url}-${idx}`} className="feed-image-thumb" src={url} alt={`cast image ${idx + 1}`} />
              ))}
            </div>
          ) : null}
          <div className="feed-content">
            <p className="feed-text">{currentFeed.text}</p>
            <p className="feed-author">— {currentFeed.author}</p>
          </div>
        </article>
      ) : null}
    </div>
  );
}