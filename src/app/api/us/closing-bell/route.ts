import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
const API_BASE = API_BASE_URL;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test') || 'false';

    try {
        const response = await fetch(`${API_BASE}/api/us/stocks/closing-bell-recommendations?test=${test}`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Closing Bell API error:', error);
        return NextResponse.json({
            error: 'Failed to fetch closing bell data',
            status: 'not_time',
            message: 'Closing Bell available 14:45-16:00 EST'
        }, { status: 200 });
    }
}
