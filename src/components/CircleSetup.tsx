'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useRef } from 'react'; 

type Circle = { fid: number; username: string; pfp: string; profile: string }


export function CircleGenerator() {
    const [mutuals, setMutuals] = useState<Circle[]>([]);
    const [selectedFids, setSelectedFids] = useState<Set<number>>(new Set());
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
            const response = await fetch(url ?? '/api/mutuals');

            if (!response.ok) {
                throw new Error('Failed to fetch mutuals');
            }

            const data = await response.json();
            console.log('mutuals response', data);

            const items = Array.isArray(data?.items) ? data.items : [];
            const mapped: Circle[] = items.map((it: any) => ({
                fid: Number(it.fid),
                username: String(it.username ?? ''),
                pfp: String(it.pfp ?? ''),
                profile: String(it.bio ?? '')
            }));
            setMutuals(mapped);

            setIsAnimating(false);
            setIsLoading(false);
        } catch (error) {
            console.error('error fetching mutuals:', error);
            setIsLoading(false);
            setIsAnimating(false);
        }
    };

    // get user context (fid) from farcaster app if user authenticated
    useEffect(() => {

        (async () => {
            // get user context from farcaster
            const getUser = async () => {
                try {
                    const context = await sdk.context;
                    if (context && context.user) {
                        setUsername((context.user as any).username || (context.user as any).displayName || (context.user as any).display_name || '')
                        setFid(context.user.fid);
                    }
                } catch (error) {
                    console.log('not in farcaster context');
                }

            };
            await getUser();
        })();
    }, []);

    // fetch mutuals when fid is ready
    useEffect(() => {
        if (fid == null) return; // exists Effect early until fid is set
        const url = `/api/mutuals?fid=${fid}`
        fetchMutuals(url);
        // after fetching intent, also try to hydrate selection from localStorage
        try {
            const key = `circle:${fid}`;
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
            if (raw) {
                const arr: unknown = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    const limited = arr.slice(0, 5).map((n) => Number(n)).filter((n) => Number.isFinite(n));
                    setSelectedFids(new Set(limited));
                }
            }
        } catch (e) {
            console.warn('Failed to read circle from localStorage');
        }
    }, [fid]);

    // scroll after data is set
    useEffect(() => {
        if (mutuals.length === 0) return;
        containerRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [mutuals])

    // persist selection whenever it changes
    useEffect(() => {
        if (fid == null) return;
        try {
            const key = `circle:${fid}`;
            const arr = Array.from(selectedFids);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(arr));
            }
        } catch (e) {
            console.warn('Failed to write circle to localStorage');
        }
    }, [selectedFids, fid]);

    if (mutuals.length === 0 && !isLoading) return "nothing is happening here. no mutuals";

    const toggleSelect = (userFid: number) => {
        setSelectedFids(prev => {
            const next = new Set(prev);
            if (next.has(userFid)) {
                next.delete(userFid);
                return next;
            }
            if (next.size >= 5) {
                console.warn('Maximum 5 users can be selected');
                return next;
            }
            next.add(userFid);
            return next;
        });
    };

    return (
        <div ref={containerRef} className={`mutuals-container ${!isAnimating ? 'fade-in' : ''}`}>
            {username && (
                <>
                <h1 className="greeting"> Hi, {username} </h1>
                <p className="subheading"> Select 5 Friends </p>
                </>
            )}

            {isLoading ? (
                <p className='circle-text'> Loading</p>
            ) : (
                <div className="mutuals-box" role="region" aria-label="mutuals list">
                    {mutuals.map((m) => (
                        <article key={m.fid} className="mutual-card">
                            <div className="mutual-person">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img className="mutual-pfp" src={m.pfp} alt={`pfp of ${m.username}`} />
                                <div className="mutual-texts">
                                    <p className="mutual-username">{m.username}</p>
                                    {m.profile ? (<p className="mutual-profile">{m.profile}</p>) : null}
                                </div>
                            </div>
                            <label className="mutual-toggle">
                                <input
                                    type="checkbox"
                                    checked={selectedFids.has(m.fid)}
                                    onChange={() => toggleSelect(m.fid)}
                                />
                                <span className="slider" aria-hidden="true"></span>
                            </label>
                        </article>
                    ))}
                </div>
            )}
            </div>
        );
}