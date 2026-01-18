'use client';

import { Card, Text, Group, SimpleGrid, Badge, Skeleton, Box } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import useSWR from 'swr';
import { designTokens } from '@/lib/theme';

interface IndexData {
    name: string;
    symbol: string;
    price: number;
    change: number;
    change_pct: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Index symbols and their display config
const indexConfig: Record<string, { emoji: string; label: string }> = {
    '^DJI': { emoji: '📊', label: 'Dow Jones' },
    '^GSPC': { emoji: '📈', label: 'S&P 500' },
    '^IXIC': { emoji: '💻', label: 'NASDAQ' },
    '^RUT': { emoji: '🏢', label: 'Russell 2000' },
    '^VIX': { emoji: '⚡', label: 'VIX' },
    'GC=F': { emoji: '🥇', label: 'Gold' },
    'CL=F': { emoji: '🛢️', label: 'Crude Oil' },
    'BTC-USD': { emoji: '₿', label: 'Bitcoin' },
    '^TNX': { emoji: '📉', label: '10Y Treasury' },
    'KRW=X': { emoji: '💵', label: 'USD/KRW' },
};

export default function MarketIndices() {
    const { data, error, isLoading } = useSWR(
        '/api/us/portfolio',
        fetcher,
        { refreshInterval: 60000 }
    );

    if (isLoading) {
        return (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} height={100} radius="md" />
                ))}
            </SimpleGrid>
        );
    }

    const indices = data?.market_indices || [];

    return (
        <Box mb="lg">
            <Text size="sm" c="dimmed" mb="sm" fw={500}>US Market Indices</Text>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md">
                {indices.map((item: IndexData) => {
                    const config = indexConfig[item.symbol] || { emoji: '📊', label: item.name };
                    const isPositive = item.change >= 0;

                    return (
                        <Card
                            key={item.symbol}
                            className="glass-card"
                            padding="md"
                            radius="lg"
                            style={{ cursor: 'pointer' }}
                        >
                            <Group justify="space-between" mb={4}>
                                <Text size="xs" c="dimmed">{config.emoji} {config.label}</Text>
                                {isPositive ? (
                                    <IconTrendingUp size={16} color={designTokens.colors.positive} />
                                ) : (
                                    <IconTrendingDown size={16} color={designTokens.colors.negative} />
                                )}
                            </Group>

                            <Text size="xl" fw={700}>
                                {item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Text>

                            <Group gap={4}>
                                <Badge
                                    size="sm"
                                    variant="light"
                                    color={isPositive ? 'teal' : 'red'}
                                >
                                    {isPositive ? '+' : ''}{item.change_pct?.toFixed(2) || item.change?.toFixed(2)}%
                                </Badge>
                            </Group>
                        </Card>
                    );
                })}
            </SimpleGrid>
        </Box>
    );
}
