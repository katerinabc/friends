'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function QuoteGenerator() {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');

  const fetchRandomQuote = async () => {
    setIsLoading(true);
    setIsAnimating(true);
    
    try {
      const response = await fetch('/api/quote');
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      
      const data = await response.json();
      
      setTimeout(() => {
        setCurrentQuote({
          text: data.text,
          author: data.ref
        });
        setIsAnimating(false);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setIsLoading(false);
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    // Fetch initial quote
    fetchRandomQuote();

    // Get user context from Farcaster
    const getUser = async () => {
      try {
        const context = await sdk.context;
        if (context && context.user) {
          setUsername(context.user.username || context.user.displayName || 'friend');
        }
      } catch (error) {
        console.log('Not in Farcaster context');
      }
    };
    getUser();
  }, []);

  if (!currentQuote && !isLoading) return null;

  return (
    <div className={`quote-container ${!isAnimating ? 'fade-in' : ''}`}>
      {username && (
        <>
          <h1 className="greeting">Hi, {username}</h1>
          <p className="subheading">Here's your quote:</p>
        </>
      )}
      {isLoading ? (
        <p className="quote-text">Loading...</p>
      ) : (
        <>
          <p className="quote-text">{currentQuote.text}</p>
          <p className="quote-author">— {currentQuote.author}</p>
        </>
      )}
      <button 
        className="generate-button" 
        onClick={fetchRandomQuote}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Generate New Quote'}
      </button>
    </div>
  );
}