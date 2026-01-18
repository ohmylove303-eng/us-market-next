import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-market-dashboard-jsh.onrender.com';

export async function GET(request: NextRequest) {
    try {
        const lang = request.nextUrl.searchParams.get('lang') || 'ko';
        const model = request.nextUrl.searchParams.get('model') || 'gemini';

        const response = await fetch(`${API_BASE_URL}/api/us/macro-analysis?lang=${lang}&model=${model}`, {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return NextResponse.json({
                macro_indicators: {},
                ai_analysis: '',
                error: 'Macro analysis not available'
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Macro Analysis API error:', error);
        return NextResponse.json({
            macro_indicators: {},
            ai_analysis: '',
            error: 'Failed to fetch macro analysis'
        }, { status: 500 });
    }
}
