// API client for Flask backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://us-market-dashboard-jsh.onrender.com';

export interface MarketIndex {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

export interface SmartMoneyPick {
    ticker: string;
    name: string;
    sector: string;
    score: number;
    recommendation: string;
    currentPrice: number;
    targetPrice: number;
    upside: number;
}

export interface ETFFlow {
    symbol: string;
    name: string;
    flow: number;
    isInflow: boolean;
}

export interface ChartData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Fetch market indices
export async function fetchMarketIndices(): Promise<MarketIndex[]> {
    const res = await fetch(`${API_BASE}/api/us/portfolio`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch indices');
    const data = await res.json();
    return data.indices || [];
}

// Fetch smart money picks
export async function fetchSmartMoney(): Promise<SmartMoneyPick[]> {
    const res = await fetch(`${API_BASE}/api/us/smart-money`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('Failed to fetch smart money');
    const data = await res.json();
    return data.picks || [];
}

// Fetch ETF flows
export async function fetchETFFlows(): Promise<{ inflows: ETFFlow[]; outflows: ETFFlow[] }> {
    const res = await fetch(`${API_BASE}/api/us/etf-flows`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('Failed to fetch ETF flows');
    return res.json();
}

// Fetch stock chart data
export async function fetchChartData(ticker: string): Promise<ChartData[]> {
    const res = await fetch(`${API_BASE}/api/us/chart/${ticker}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch chart');
    const data = await res.json();
    return data.data || [];
}

// Fetch sector heatmap
export async function fetchSectorHeatmap() {
    const res = await fetch(`${API_BASE}/api/us/sector-heatmap`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error('Failed to fetch heatmap');
    return res.json();
}
