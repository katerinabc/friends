// The Intuition component is actually a new app, but this was quicker than forking. I know, messy, but the goal is to learn new tools. Will clean up.
// ignore all casts that do not have text longer than 100 characters

// Behavior: Next to each cast is a button saying $trust. Clicking it shows a modal (new screen) with a text area and buttons to submit. The text area is pre-filled with the cast text. 
// The buttons say "extract identity". When a user selects "extract identity", the entities from the cast are extracted. 
// If the entity already exists in the db, show it in green. If it doesn't, show it in red. Then the user can submit identity.
// then the user can go back to the previous screen or submit relationship between the entities. 


//future version: check the DB and Intuition blockchain. submitting is then an onchain transaction. Fork the code and build a proper mini-app for that.

'use client';

import { useState, useEffect } from 'react';
import { Feed } from '@/types/cast';
import { sdk } from '@farcaster/miniapp-sdk';
import { useRef } from 'react';
import Link from 'next/link';


export function IntuitionGenerator() {
    const [feeds, setFeeds] = useState<Feed[]>([]); // set feeds to Feed or empty array
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [fid, setFid] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null); // for autoscroll

    const fetchFeed = async (url?: string) => {
        setIsLoading(true); // true = data is not yet loaded
        setIsAnimating(true); // true = do not apply CSS animation
        console.log('GET', url);

        try {
            const response = await fetch(url ?? 'api/feeds');

            if (!response.ok) {
                throw new Error('Failed to fetch following feed');
            }
        const data = await response.json();
        console.log('neynar response', data)

        const casts: Feed[] = Array.isArray(data?.items) ? data.items : [];
        setFeeds(casts);
        setIsAnimating(false); // false = data is loaded
        setIsLoading(false); // false = data is loaded
        } catch (error) {
            console.error('Error fetching feed:', error);
            setIsLoading(false);
            setIsAnimating(false);
        }
    };

    // get user context (fid) from farcaster app if user authenticated
    // why is there an async function inside another async function. 
    // could be written down somewhere else as used in different places
  useEffect(() => { 
    
    (async () => { 
    
    // Get user context from Farcaster
    const getUser = async () => { // function to get the user's context. 
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
    await getUser(); //call the function getUser inside the Effect
    })();

  }, []); // no dependencies means run once the components mounts

  // fetch feed when fid is available (ready)
  useEffect(() => {

    if (fid == null) return; //exist effect when no fid
    const url = `api/feeds?fid=${fid}`; // add the fid to the url
    fetchFeed(url); //call to fetchFeed function that calls the API via <api />
  }, [fid]); // run when fid changes

  // scroll after feed is set to see more data. runs when feeds changes
  useEffect(() => {
    if (!feeds || feeds.length == 0) return;
    containerRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [feeds])

  // fix timestamp formatting. now shown as 2025-09-25T07:06:55.000Z
  // passing cast text to url makes for a very long url.
  return (
    <div ref={containerRef} className={`feed-container ${!isAnimating ? 'fade-in' : ''}`}>
        {username && (
            <>
            <h1 className="greeting">Hi, {username}</h1>
            <p className="subheading">Here are your casts:</p>
            </>
        )}

        {isLoading ? (
            <p className="feed-text"> Loading...</p>
        ) : (
            <>
            {feeds.map((item, idx) =>
                <article key={`feed-${idx}`} className="feed-card">
                    <div className="feed-content">
                        <p className="feed-text">{item.text}</p>
                        <p className="feed-author">- {item.author}</p>
                        <p className="feed-timestamp"> {item.timestamp}</p>
                    </div>
                    < Link href={`/uploadtrust?text=${item.text}?author=${item.author}`} className="trust-button">
                        Upload Intuition
                    </Link>
                </article>
                )
            }
            </>

        )}
    </div>
  );
}

