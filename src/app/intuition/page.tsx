import Link from 'next/link';
import { IntuitionGenerator } from '@/components/Intuition';

export default function CirclePage() {
    return (
        <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
                <Link href="/">← Back to feed</Link>
            </div>
            <IntuitionGenerator />
        </main>
    );
}


