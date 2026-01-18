import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-market-dashboard-jsh.onrender.com';

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/us/corporate-events`, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json({
                earnings: [],
                events: [],
                news: [],
                error: 'News events not available'
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('News Events API error:', error);
        return NextResponse.json({
            earnings: [],
            events: [],
            news: [],
            error: 'Failed to fetch news events'
        }, { status: 500 });
    }
}
