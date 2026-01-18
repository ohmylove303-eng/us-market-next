'use client';

import { Card, Text, Group, SimpleGrid, Badge, Skeleton, Stack, Progress } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import useSWR from 'swr';
import { designTokens } from '@/lib/theme';

interface Flow {
    ticker: string;
    name: string;
    flow_score: number;
    price_change_20d: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ETFFlows() {
    const { data, isLoading } = useSWR(
        '/api/us/etf-flows',
        fetcher,
        { refreshInterval: 300000 }
    );

    if (isLoading) {
        return (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <Skeleton height={300} radius="md" />
                <Skeleton height={300} radius="md" />
            </SimpleGrid>
        );
    }

    const inflows: Flow[] = data?.top_inflows || [];
    const outflows: Flow[] = data?.top_outflows || [];

    return (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {/* Top Inflows */}
            <Card className="glass-card" padding="lg" radius="lg">
                <Group justify="space-between" mb="md">
                    <Group gap="xs">
                        <IconArrowUpRight size={20} color={designTokens.colors.positive} />
                        <Text size="lg" fw={600}>Top Inflows</Text>
                    </Group>
                    <Badge variant="light" color="teal">자금 유입</Badge>
                </Group>

                <Stack gap="sm">
                    {inflows.slice(0, 5).map((item) => (
                        <div key={item.ticker}>
                            <Group justify="space-between" mb={4}>
                                <Group gap="xs">
                                    <Text fw={600}>{item.ticker}</Text>
                                    <Text size="xs" c="dimmed">{item.name}</Text>
                                </Group>
                                <Text fw={600} c="teal">
                                    +{item.price_change_20d?.toFixed(1)}%
                                </Text>
                            </Group>
                            <Progress
                                value={item.flow_score}
                                color="teal"
                                size="sm"
                                radius="xl"
                            />
                        </div>
                    ))}
                </Stack>
            </Card>

            {/* Top Outflows */}
            <Card className="glass-card" padding="lg" radius="lg">
                <Group justify="space-between" mb="md">
                    <Group gap="xs">
                        <IconArrowDownRight size={20} color={designTokens.colors.negative} />
                        <Text size="lg" fw={600}>Top Outflows</Text>
                    </Group>
                    <Badge variant="light" color="red">자금 유출</Badge>
                </Group>

                <Stack gap="sm">
                    {outflows.slice(0, 5).map((item) => (
                        <div key={item.ticker}>
                            <Group justify="space-between" mb={4}>
                                <Group gap="xs">
                                    <Text fw={600}>{item.ticker}</Text>
                                    <Text size="xs" c="dimmed">{item.name}</Text>
                                </Group>
                                <Text fw={600} c="red">
                                    {item.price_change_20d?.toFixed(1)}%
                                </Text>
                            </Group>
                            <Progress
                                value={100 - item.flow_score}
                                color="red"
                                size="sm"
                                radius="xl"
                            />
                        </div>
                    ))}
                </Stack>
            </Card>
        </SimpleGrid>
    );
}
