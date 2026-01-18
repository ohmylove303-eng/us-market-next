'use client';

import { Card, Text, SimpleGrid, Skeleton, Box, Tooltip } from '@mantine/core';
import useSWR from 'swr';
import { designTokens } from '@/lib/theme';

interface Stock {
    ticker: string;
    name: string;
    change: number;
    sector: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MarketMap() {
    const { data, isLoading } = useSWR(
        '/api/us/smart-money',
        fetcher,
        { refreshInterval: 300000 }
    );

    if (isLoading) {
        return <Skeleton height={300} radius="md" />;
    }

    const picks = data?.top_picks || [];

    // Create market map from Smart Money picks
    const stocks: Stock[] = picks.slice(0, 20).map((p: any) => ({
        ticker: p.ticker,
        name: p.name,
        change: p.target_upside || 0,
        sector: p.sector,
    }));

    const getColor = (change: number) => {
        if (change >= 10) return 'rgba(48, 209, 88, 0.9)';
        if (change >= 5) return 'rgba(48, 209, 88, 0.7)';
        if (change >= 0) return 'rgba(48, 209, 88, 0.5)';
        if (change >= -5) return 'rgba(255, 69, 58, 0.5)';
        if (change >= -10) return 'rgba(255, 69, 58, 0.7)';
        return 'rgba(255, 69, 58, 0.9)';
    };

    const getSize = (idx: number) => {
        if (idx < 3) return 2;
        if (idx < 8) return 1.5;
        return 1;
    };

    return (
        <Card className="glass-card" padding="lg" radius="lg" h={350}>
            <Text size="lg" fw={600} mb="md">🗺️ Market Map</Text>

            <Box style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100% - 40px)'
            }}>
                {stocks.map((stock, idx) => (
                    <Tooltip
                        key={stock.ticker}
                        label={`${stock.name} | ${stock.sector} | ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(1)}%`}
                        withArrow
                    >
                        <Box
                            style={{
                                background: getColor(stock.change),
                                borderRadius: 8,
                                padding: '8px 12px',
                                minWidth: 60 * getSize(idx),
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Text size="sm" fw={700} c="white">{stock.ticker}</Text>
                            <Text size="xs" c="white" opacity={0.9}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                            </Text>
                        </Box>
                    </Tooltip>
                ))}
            </Box>
        </Card>
    );
}
