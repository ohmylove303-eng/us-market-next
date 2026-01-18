'use client';

import { useEffect, useState } from 'react';
import {
    Card,
    Text,
    Title,
    Badge,
    Group,
    Stack,
    SimpleGrid,
    Table,
    Progress,
    Tabs,
    Loader,
    Center,
    RingProgress,
    ThemeIcon,
} from '@mantine/core';
import {
    IconTarget,
    IconTrendingUp,
    IconTrendingDown,
    IconChartBar,
    IconCheck,
    IconX,
    IconClock,
} from '@tabler/icons-react';

interface PerformanceRecord {
    ticker: string;
    name: string;
    recommended_date: string;
    recommended_price?: number;
    entry_price?: number;
    target_price?: number;
    current_price: number;
    days_held: number;
    return_pct: number;
    status: 'active' | 'success' | 'failed';
    target_hit?: boolean;
    conditions?: string[];
}

interface PerformanceStats {
    total_recommendations: number;
    active: number;
    successful: number;
    failed: number;
    hit_rate: number;
    avg_return: number;
    best_pick: { ticker: string; return_pct: number };
    worst_pick: { ticker: string; return_pct: number };
    history: PerformanceRecord[];
}

interface PerformanceData {
    last_updated: string | null;
    smart_money: PerformanceStats;
    closing_bell: PerformanceStats;
}

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
}) => (
    <Card
        padding="lg"
        radius="xl"
        style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
        }}
    >
        <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
                <Text size="sm" c="dimmed">{title}</Text>
                <Title order={2} style={{ color }}>{value}</Title>
                {subtitle && <Text size="xs" c="dimmed">{subtitle}</Text>}
            </Stack>
            <ThemeIcon size={48} radius="xl" variant="light" color={color}>
                <Icon size={24} />
            </ThemeIcon>
        </Group>
    </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
        success: { color: 'green', icon: IconCheck, label: '목표 도달' },
        failed: { color: 'red', icon: IconX, label: '손절/만료' },
        active: { color: 'yellow', icon: IconClock, label: '진행중' },
    };

    const { color, icon: Icon, label } = config[status] || config.active;

    return (
        <Badge
            color={color}
            variant="light"
            leftSection={<Icon size={12} />}
            size="sm"
        >
            {label}
        </Badge>
    );
};

const PerformanceTable = ({
    records,
    type
}: {
    records: PerformanceRecord[];
    type: 'smart_money' | 'closing_bell';
}) => {
    if (!records || records.length === 0) {
        return (
            <Center py="xl">
                <Stack align="center" gap="xs">
                    <IconChartBar size={48} color="gray" opacity={0.5} />
                    <Text c="dimmed" size="sm">아직 추적된 데이터가 없습니다</Text>
                    <Text c="dimmed" size="xs">첫 번째 데이터 업데이트 후 표시됩니다</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Table.ScrollContainer minWidth={600}>
            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>종목</Table.Th>
                        <Table.Th>추천일</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>추천가</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>현재가</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>수익률</Table.Th>
                        <Table.Th>보유일</Table.Th>
                        <Table.Th>상태</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {records.map((record, idx) => (
                        <Table.Tr key={`${record.ticker}-${record.recommended_date}-${idx}`}>
                            <Table.Td>
                                <Group gap="xs">
                                    <Text fw={600}>{record.ticker}</Text>
                                    <Text size="xs" c="dimmed" lineClamp={1} maw={120}>
                                        {record.name}
                                    </Text>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{record.recommended_date}</Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                                <Text size="sm" ff="monospace">
                                    ${(record.recommended_price || record.entry_price || 0).toFixed(2)}
                                </Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                                <Text size="sm" ff="monospace">
                                    ${record.current_price.toFixed(2)}
                                </Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                                <Text
                                    size="sm"
                                    fw={600}
                                    c={record.return_pct >= 0 ? 'teal' : 'red'}
                                    ff="monospace"
                                >
                                    {record.return_pct >= 0 ? '+' : ''}{record.return_pct.toFixed(2)}%
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <Badge variant="outline" color="gray" size="sm">
                                    {record.days_held}일
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <StatusBadge status={record.status} />
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
};

export function PerformanceTab() {
    const [data, setData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>('smart_money');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/us/performance');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Failed to fetch performance data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Center h={400}>
                <Stack align="center" gap="md">
                    <Loader size="lg" type="dots" />
                    <Text c="dimmed">성과 데이터 로딩 중...</Text>
                </Stack>
            </Center>
        );
    }

    const stats = activeTab === 'smart_money' ? data?.smart_money : data?.closing_bell;
    const completed = (stats?.successful || 0) + (stats?.failed || 0);

    return (
        <Stack gap="lg">
            {/* Header */}
            <Group justify="space-between" align="center">
                <div>
                    <Title order={3}>📊 추천 성과 분석</Title>
                    <Text size="sm" c="dimmed">
                        과거 추천의 실제 성과를 추적합니다
                    </Text>
                </div>
                {data?.last_updated && (
                    <Badge variant="light" color="blue" size="lg">
                        마지막 업데이트: {new Date(data.last_updated).toLocaleDateString('ko-KR')}
                    </Badge>
                )}
            </Group>

            {/* Summary Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                <StatCard
                    title="적중률"
                    value={`${stats?.hit_rate || 0}%`}
                    subtitle={`${completed}건 완료`}
                    icon={IconTarget}
                    color="teal"
                />
                <StatCard
                    title="평균 수익률"
                    value={`${(stats?.avg_return || 0) >= 0 ? '+' : ''}${stats?.avg_return || 0}%`}
                    subtitle="전체 평균"
                    icon={IconChartBar}
                    color={(stats?.avg_return || 0) >= 0 ? 'teal' : 'red'}
                />
                <StatCard
                    title="최고 수익"
                    value={`+${stats?.best_pick?.return_pct || 0}%`}
                    subtitle={stats?.best_pick?.ticker || '-'}
                    icon={IconTrendingUp}
                    color="green"
                />
                <StatCard
                    title="최대 손실"
                    value={`${stats?.worst_pick?.return_pct || 0}%`}
                    subtitle={stats?.worst_pick?.ticker || '-'}
                    icon={IconTrendingDown}
                    color="red"
                />
            </SimpleGrid>

            {/* Progress Ring */}
            {completed > 0 && (
                <Card
                    padding="lg"
                    radius="xl"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <Group justify="center" gap="xl">
                        <RingProgress
                            size={160}
                            thickness={12}
                            roundCaps
                            sections={[
                                { value: (stats?.successful || 0) / completed * 100, color: 'teal' },
                                { value: (stats?.failed || 0) / completed * 100, color: 'red' },
                            ]}
                            label={
                                <Center>
                                    <Stack gap={0} align="center">
                                        <Text size="xl" fw={700}>{stats?.hit_rate || 0}%</Text>
                                        <Text size="xs" c="dimmed">적중률</Text>
                                    </Stack>
                                </Center>
                            }
                        />
                        <Stack gap="xs">
                            <Group gap="xs">
                                <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--mantine-color-teal-6)' }} />
                                <Text size="sm">성공: {stats?.successful || 0}건</Text>
                            </Group>
                            <Group gap="xs">
                                <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--mantine-color-red-6)' }} />
                                <Text size="sm">실패: {stats?.failed || 0}건</Text>
                            </Group>
                            <Group gap="xs">
                                <div style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--mantine-color-yellow-6)' }} />
                                <Text size="sm">진행중: {stats?.active || 0}건</Text>
                            </Group>
                        </Stack>
                    </Group>
                </Card>
            )}

            {/* Tabs for Smart Money vs Closing Bell */}
            <Card
                padding="lg"
                radius="xl"
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="smart_money" leftSection={<IconChartBar size={16} />}>
                            Smart Money ({data?.smart_money?.total_recommendations || 0})
                        </Tabs.Tab>
                        <Tabs.Tab value="closing_bell" leftSection={<IconClock size={16} />}>
                            Closing Bell ({data?.closing_bell?.total_recommendations || 0})
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="smart_money" pt="md">
                        <PerformanceTable
                            records={data?.smart_money?.history || []}
                            type="smart_money"
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="closing_bell" pt="md">
                        <PerformanceTable
                            records={data?.closing_bell?.history || []}
                            type="closing_bell"
                        />
                    </Tabs.Panel>
                </Tabs>
            </Card>

            {/* Disclaimer */}
            <Text size="xs" c="dimmed" ta="center">
                ⚠️ 본 성과 데이터는 참고용이며, 과거 성과가 미래 수익을 보장하지 않습니다.
            </Text>
        </Stack>
    );
}
