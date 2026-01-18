'use client';

import { Card, Table, Text, Badge, Group, Skeleton, Box, ScrollArea } from '@mantine/core';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import useSWR from 'swr';
import { designTokens } from '@/lib/theme';

interface Pick {
    ticker: string;
    name: string;
    sector: string;
    final_score: number;
    ai_recommendation: string;
    current_price: number;
    price_at_rec: number;
    target: number;
    target_upside: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SmartMoneyTable() {
    const { data, error, isLoading } = useSWR(
        '/api/us/smart-money',
        fetcher,
        { refreshInterval: 300000 }
    );

    if (isLoading) {
        return <Skeleton height={400} radius="md" />;
    }

    const picks: Pick[] = data?.top_picks || [];

    const getBadgeColor = (rec: string) => {
        if (rec?.toLowerCase().includes('buy')) return 'teal';
        if (rec?.toLowerCase().includes('hold')) return 'yellow';
        return 'red';
    };

    return (
        <Card className="glass-card" padding="lg" radius="lg">
            <Group justify="space-between" mb="md">
                <Text size="lg" fw={600}>📋 Final Top 10 - Smart Money Picks</Text>
                <Badge variant="light" color="blue">최신 분석</Badge>
            </Group>

            <ScrollArea>
                <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>#</Table.Th>
                            <Table.Th>TICKER</Table.Th>
                            <Table.Th>SECTOR</Table.Th>
                            <Table.Th>SCORE</Table.Th>
                            <Table.Th>AI 추천</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>추천가</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>현재가</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>목표 UPSIDE</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {picks.slice(0, 10).map((pick, idx) => (
                            <Table.Tr key={pick.ticker} style={{ cursor: 'pointer' }}>
                                <Table.Td>
                                    <Text c="dimmed" size="sm">{idx + 1}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Text fw={600}>{pick.ticker}</Text>
                                        <Text size="xs" c="dimmed">{pick.name?.slice(0, 20)}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="outline" size="sm">{pick.sector}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Text fw={600} c="blue">{pick.final_score?.toFixed(1)}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={getBadgeColor(pick.ai_recommendation)} variant="filled" size="sm">
                                        {pick.ai_recommendation || 'Hold'}
                                    </Badge>
                                </Table.Td>
                                <Table.Td style={{ textAlign: 'right' }}>
                                    <Text size="sm">${pick.price_at_rec?.toFixed(2) || 'N/A'}</Text>
                                </Table.Td>
                                <Table.Td style={{ textAlign: 'right' }}>
                                    <Text size="sm" fw={500}>${pick.current_price?.toFixed(2)}</Text>
                                </Table.Td>
                                <Table.Td style={{ textAlign: 'right' }}>
                                    <Group gap={4} justify="flex-end">
                                        {(pick.target_upside || 0) >= 0 ? (
                                            <IconArrowUp size={14} color={designTokens.colors.positive} />
                                        ) : (
                                            <IconArrowDown size={14} color={designTokens.colors.negative} />
                                        )}
                                        <Text
                                            fw={600}
                                            c={(pick.target_upside || 0) >= 0 ? 'teal' : 'red'}
                                        >
                                            {pick.target_upside >= 0 ? '+' : ''}{pick.target_upside?.toFixed(1)}%
                                        </Text>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Card>
    );
}
