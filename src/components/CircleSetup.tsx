'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useRef } from 'react'; 


export function CircleGenerator() {
    const [currentCircle, setCurrentCircle] = useState<Circle | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [fid, setFid] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null); // for auto-scroll

    const fetchMutuals = async (url?: string) => {
        setIsLoading(true);
        setIsAnimating(true);
        console.log('GET', url);

        try {
            const response = await fetch(url ?? 'api/mutuals');

            if (!response.ok) {
                throw new Error('Failted to fetch mutuals');
            }

        const data = await response.json();
        console.log('neynar response', data)

        setCurrentCircle({fid: data.fid, username: data.username, pic: data.pfp_url})
        }
    }

}