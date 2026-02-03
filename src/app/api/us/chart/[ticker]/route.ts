import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';


export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    const { ticker } = await params;

    try {
        console.log(`Fetching chart for ${ticker} from ${API_BASE_URL}`);
        const response = await fetch(`${API_BASE_URL}/api/us/stock-chart/${ticker}`, {

            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chart API error:', error);
        return NextResponse.json({ error: 'Failed to fetch chart' }, { status: 500 });
    }
}
