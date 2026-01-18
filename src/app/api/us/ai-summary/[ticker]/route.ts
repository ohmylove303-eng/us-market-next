import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-market-dashboard-jsh.onrender.com';

export async function GET(
    request: NextRequest,
    { params }: { params: { ticker: string } }
) {
    try {
        const ticker = params.ticker;
        const lang = request.nextUrl.searchParams.get('lang') || 'ko';

        const response = await fetch(`${API_BASE_URL}/api/us/ai-summary/${ticker}?lang=${lang}`, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json({
                ticker,
                summary: '',
                error: 'AI analysis not available'
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('AI Summary API error:', error);
        return NextResponse.json({
            ticker: params.ticker,
            summary: '',
            error: 'Failed to fetch AI analysis'
        }, { status: 500 });
    }
}
