import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ ticker: string }> }
) {
    try {
        const { ticker } = await context.params;
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
        const { ticker } = await context.params;
        return NextResponse.json({
            ticker,
            summary: '',
            error: 'Failed to fetch AI analysis'
        }, { status: 500 });
    }
}
