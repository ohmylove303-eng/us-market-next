import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET() {
    try {
        console.log(`Fetching smart money from ${API_BASE_URL}`);
        const response = await fetch(`${API_BASE_URL}/api/us/smart-money`, {

            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Smart Money API error:', error);
        return NextResponse.json({ error: 'Failed to fetch smart money' }, { status: 500 });
    }
}
