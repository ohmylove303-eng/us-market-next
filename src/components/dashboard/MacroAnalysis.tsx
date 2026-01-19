'use client';

import { Card, Text, Group, SimpleGrid, Paper, Skeleton, Badge, Stack, Divider, Title } from '@mantine/core';
import {
    IconTrendingUp,
    IconTrendingDown,
    IconChartBar,
    IconCoin,
    IconGasStation,
    IconCoins,
    IconCurrencyBitcoin,
    IconWorld
} from '@tabler/icons-react';

import useSWR from 'swr';

interface MacroIndicator {
    value?: number;
    current?: number;
    change_1d?: number;
}

interface MacroData {
    macro_indicators: Record<string, MacroIndicator>;
    ai_analysis: string;
    timestamp?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const IndicatorCard = ({
    name,
    value,
    change,
    icon: Icon
}: {
    name: string;
    value: number | string;
    change: number;
    icon: any;
}) => {
    const isPositive = change >= 0;

    return (
        <Paper
            p="md"
            radius="md"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
            }}
        >
            <Group justify="space-between" mb="xs">
                <Group gap="xs">
                    <Icon size={16} color="gray" />
                    <Text size="xs" c="dimmed">{name}</Text>
                </Group>
                <Badge
                    size="xs"
                    variant="light"
                    color={isPositive ? 'teal' : 'red'}
                >
                    {isPositive ? '+' : ''}{change?.toFixed(2)}%
                </Badge>
            </Group>
            <Text fw={700} size="lg">
                {typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : value}
            </Text>
        </Paper>
    );
};

export default function MacroAnalysis() {
    const { data, error, isLoading } = useSWR<MacroData>(
        '/api/us/macro-analysis',
        fetcher,
        { refreshInterval: 300000 }
    );

    if (isLoading) {
        return <Skeleton height={300} radius="md" />;
    }

    if (error || !data) {
        return (
            <Card className="glass-card" padding="lg" radius="lg">
                <Text c="dimmed">매크로 분석 데이터를 불러올 수 없습니다.</Text>
            </Card>
        );
    }

    const indicators = data.macro_indicators || {};

    // Map indicator names to icons and display names
    const indicatorConfig: Record<string, { icon: any; displayName: string; format?: string }> = {
        'VIX': { icon: IconChartBar, displayName: 'VIX (변동성)' },
        'DXY': { icon: IconWorld, displayName: '달러 인덱스' },
        '10Y_Yield': { icon: IconTrendingUp, displayName: '10년물 금리' },
        'GOLD': { icon: IconCoins, displayName: '금 (Gold)' },
        'OIL': { icon: IconGasStation, displayName: '원유 (WTI)' },
        'BTC': { icon: IconCurrencyBitcoin, displayName: '비트코인' },
        'SPY': { icon: IconTrendingUp, displayName: 'S&P 500 ETF' },
        'QQQ': { icon: IconTrendingUp, displayName: 'Nasdaq 100 ETF' },
        'USD/KRW': { icon: IconCoin, displayName: '달러/원' },
    };

    return (
        <Card className="glass-card" padding="lg" radius="lg">
            <Group justify="space-between" mb="md">
                <Title order={4}>🌍 매크로 시장 분석</Title>
                <Badge variant="light" color="blue">
                    {data.timestamp ? new Date(data.timestamp).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '실시간'}
                </Badge>
            </Group>

            {/* Key Indicators */}
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md" mb="lg">
                {Object.entries(indicators).map(([key, indicator]) => {
                    const config = indicatorConfig[key] || { icon: IconChartBar, displayName: key };
                    const value = indicator?.current || indicator?.value || 0;
                    const change = indicator?.change_1d || 0;

                    return (
                        <IndicatorCard
                            key={key}
                            name={config.displayName}
                            value={value}
                            change={change}
                            icon={config.icon}
                        />
                    );
                })}
            </SimpleGrid>

            <Divider my="md" />

            {/* AI Analysis */}
            <Title order={5} mb="md">📊 AI 시장 분석</Title>
            {data.ai_analysis ? (
                <Paper
                    p="md"
                    radius="md"
                    style={{
                        background: 'rgba(0,100,255,0.03)',
                        border: '1px solid rgba(0,100,255,0.1)',
                        maxHeight: 400,
                        overflow: 'auto'
                    }}
                >
                    <Text
                        size="sm"
                        style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                        dangerouslySetInnerHTML={{
                            __html: data.ai_analysis
                                .replace(/##\s*(.*)/g, '<strong style="font-size: 1.1em; display: block; margin: 16px 0 8px 0; color: #60a5fa;">$1</strong>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f5f5f7;">$1</strong>')
                                .replace(/\*\s+(.*?)(?=\n|$)/g, '<li style="margin-left: 16px; margin-bottom: 4px;">$1</li>')
                                .replace(/\n/g, '<br/>')
                        }}
                    />
                </Paper>
            ) : (
                <Text c="dimmed" ta="center" py="xl">
                    AI 분석 데이터가 없습니다. 다음 업데이트 후 확인해주세요.
                </Text>
            )}

            <Text size="xs" c="dimmed" ta="center" mt="md">
                💡 매크로 데이터는 매일 자동으로 업데이트됩니다. 투자 참고용으로만 활용하세요.
            </Text>
        </Card>
    );
}
