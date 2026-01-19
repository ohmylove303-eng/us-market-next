'use client';

import { Card, Text, Group, Box, SegmentedControl, Skeleton } from '@mantine/core';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState } from 'react';
import useSWR from 'swr';
import { designTokens } from '@/lib/theme';

interface ChartDataPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface StockChartProps {
    ticker?: string;
}

export default function StockChart({ ticker = 'AAPL' }: StockChartProps) {
    const [period, setPeriod] = useState('3M');

    // Use SWR with the ticker directly from props - this will automatically refetch when ticker changes
    const { data, isLoading } = useSWR(
        `/api/us/chart/${ticker}`,
        fetcher,
        { refreshInterval: 60000 }
    );

    if (isLoading) {
        return <Skeleton height={400} radius="md" />;
    }

    const rawData = data?.candles || [];

    // Convert timestamp to readable date format
    const chartData: ChartDataPoint[] = rawData.map((d: any) => ({
        date: new Date(d.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: 0
    }));

    // Calculate price change
    const firstPrice = chartData[0]?.close || 0;
    const lastPrice = chartData[chartData.length - 1]?.close || 0;
    const priceChange = lastPrice - firstPrice;
    const pctChange = firstPrice ? ((priceChange / firstPrice) * 100) : 0;
    const isPositive = priceChange >= 0;

    const gradientColor = isPositive ? designTokens.colors.positive : designTokens.colors.negative;

    return (
        <Card className="glass-card" padding="lg" radius="lg" h={400}>
            <Group justify="space-between" mb="md">
                <Box>
                    <Text size="lg" fw={600}>{ticker}</Text>
                    <Group gap="xs">
                        <Text size="xl" fw={700}>
                            ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                        <Text
                            size="sm"
                            fw={600}
                            c={isPositive ? 'teal' : 'red'}
                        >
                            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{pctChange.toFixed(2)}%)
                        </Text>
                    </Group>
                </Box>

                <SegmentedControl
                    value={period}
                    onChange={setPeriod}
                    data={['1M', '3M', '6M', '1Y', 'ALL']}
                    size="xs"
                />
            </Group>

            <ResponsiveContainer width="100%" height="75%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={gradientColor} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#86868b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fill: '#86868b', fontSize: 10 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                        }}
                        labelStyle={{ color: '#f5f5f7' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke={gradientColor}
                        strokeWidth={2}
                        fill={`url(#gradient-${ticker})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}
