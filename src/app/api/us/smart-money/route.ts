import { NextResponse } from 'next/server';

const API_BASE = 'https://us-market-dashboard-jsh.onrender.com';

export async function GET() {
    try {
        const response = await fetch(`${API_BASE}/api/us/smart-money`, {
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
