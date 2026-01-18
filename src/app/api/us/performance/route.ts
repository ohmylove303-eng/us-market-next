import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-market-dashboard-jsh.onrender.com';

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/us/performance`, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            // Return empty performance data if not available yet
            return NextResponse.json({
                last_updated: null,
                smart_money: {
                    total_recommendations: 0,
                    active: 0,
                    successful: 0,
                    failed: 0,
                    hit_rate: 0,
                    avg_return: 0,
                    best_pick: { ticker: '', return_pct: 0 },
                    worst_pick: { ticker: '', return_pct: 0 },
                    history: []
                },
                closing_bell: {
                    total_recommendations: 0,
                    active: 0,
                    successful: 0,
                    failed: 0,
                    hit_rate: 0,
                    avg_return: 0,
                    best_pick: { ticker: '', return_pct: 0 },
                    worst_pick: { ticker: '', return_pct: 0 },
                    history: []
                }
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Performance API error:', error);
        return NextResponse.json({
            error: 'Failed to fetch performance data',
            last_updated: null,
            smart_money: { total_recommendations: 0, history: [] },
            closing_bell: { total_recommendations: 0, history: [] }
        }, { status: 500 });
    }
}
