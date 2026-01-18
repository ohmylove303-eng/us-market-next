import { NextResponse } from 'next/server';

const API_BASE = 'https://us-market-dashboard-jsh.onrender.com';

export async function GET() {
    try {
        const response = await fetch(`${API_BASE}/api/us/etf-flows`, {
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('ETF Flows API error:', error);
        return NextResponse.json({ error: 'Failed to fetch ETF flows' }, { status: 500 });
    }
}
