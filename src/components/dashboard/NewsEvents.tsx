'use client';

import { Card, Text, Group, SimpleGrid, Paper, Skeleton, Badge, Stack, Timeline, Anchor, Title } from '@mantine/core';
import {
    IconCalendar,
    IconNews,
    IconChartLine,
    IconBuildingBank,
    IconMicrophone,
    IconReportMoney
} from '@tabler/icons-react';
import useSWR from 'swr';

interface NewsEvent {
    date?: string;
    title?: string;
    type?: string;
    ticker?: string;
    description?: string;
    impact?: string;
}

interface NewsData {
    earnings?: NewsEvent[];
    events?: NewsEvent[];
    news?: NewsEvent[];
    calendar?: NewsEvent[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const EventBadge = ({ type }: { type: string }) => {
    const typeConfig: Record<string, { color: string; icon: any; label: string }> = {
        'earnings': { color: 'blue', icon: IconReportMoney, label: '실적발표' },
        'dividend': { color: 'green', icon: IconBuildingBank, label: '배당' },
        'fed': { color: 'orange', icon: IconMicrophone, label: 'FOMC' },
        'economic': { color: 'violet', icon: IconChartLine, label: '경제지표' },
        'default': { color: 'gray', icon: IconCalendar, label: '이벤트' }
    };

    const config = typeConfig[type?.toLowerCase()] || typeConfig['default'];

    return (
        <Badge
            size="sm"
            variant="light"
            color={config.color}
            leftSection={<config.icon size={12} />}
        >
            {config.label}
        </Badge>
    );
};

const ImpactBadge = ({ impact }: { impact: string }) => {
    const impactConfig: Record<string, { color: string; label: string }> = {
        'high': { color: 'red', label: '📈 고영향' },
        'medium': { color: 'yellow', label: '⚡ 중영향' },
        'low': { color: 'gray', label: '낮음' }
    };

    const config = impactConfig[impact?.toLowerCase()] || impactConfig['low'];

    return (
        <Badge size="xs" variant="dot" color={config.color}>
            {config.label}
        </Badge>
    );
};

export default function NewsEvents() {
    const { data, error, isLoading } = useSWR<NewsData>(
        '/api/us/news-events',
        fetcher,
        { refreshInterval: 600000 }
    );

    if (isLoading) {
        return <Skeleton height={250} radius="md" />;
    }

    if (error || !data) {
        return (
            <Card className="glass-card" padding="lg" radius="lg">
                <Text c="dimmed">뉴스/이벤트 데이터를 불러올 수 없습니다.</Text>
            </Card>
        );
    }

    const earnings = data.earnings || [];
    const events = data.events || data.calendar || [];
    const allEvents = [...earnings, ...events].slice(0, 10);

    return (
        <Card className="glass-card" padding="lg" radius="lg">
            <Group justify="space-between" mb="md">
                <Title order={4}>📰 뉴스 & 이벤트 캘린더</Title>
                <Badge variant="light" color="orange">
                    이번 주
                </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {/* Earnings Calendar */}
                <Paper
                    p="md"
                    radius="md"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}
                >
                    <Group gap="xs" mb="md">
                        <IconReportMoney size={18} color="#60a5fa" />
                        <Text fw={600}>실적 발표 일정</Text>
                    </Group>

                    {earnings.length > 0 ? (
                        <Stack gap="sm">
                            {earnings.slice(0, 5).map((event, idx) => (
                                <Group key={idx} justify="space-between" wrap="nowrap">
                                    <Group gap="xs" wrap="nowrap">
                                        <Badge variant="filled" size="sm" color="blue">
                                            {event.ticker}
                                        </Badge>
                                        <Text size="sm" lineClamp={1}>{event.title || event.description}</Text>
                                    </Group>
                                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                                        {event.date}
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    ) : (
                        <Text size="sm" c="dimmed" ta="center" py="md">
                            예정된 실적 발표가 없습니다
                        </Text>
                    )}
                </Paper>

                {/* Economic Events */}
                <Paper
                    p="md"
                    radius="md"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}
                >
                    <Group gap="xs" mb="md">
                        <IconCalendar size={18} color="#f59e0b" />
                        <Text fw={600}>주요 경제 일정</Text>
                    </Group>

                    {events.length > 0 ? (
                        <Stack gap="sm">
                            {events.slice(0, 5).map((event, idx) => (
                                <Group key={idx} justify="space-between" wrap="nowrap">
                                    <Group gap="xs" wrap="nowrap">
                                        {event.impact && <ImpactBadge impact={event.impact} />}
                                        <Text size="sm" lineClamp={1}>{event.title || event.description}</Text>
                                    </Group>
                                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                                        {event.date}
                                    </Text>
                                </Group>
                            ))}
                        </Stack>
                    ) : (
                        <Text size="sm" c="dimmed" ta="center" py="md">
                            예정된 경제 일정이 없습니다
                        </Text>
                    )}
                </Paper>
            </SimpleGrid>

            {/* All Events Timeline */}
            {allEvents.length > 0 && (
                <>
                    <Text fw={600} mt="lg" mb="md">📅 전체 이벤트 타임라인</Text>
                    <Timeline active={0} bulletSize={20} lineWidth={2}>
                        {allEvents.slice(0, 6).map((event, idx) => (
                            <Timeline.Item
                                key={idx}
                                bullet={<IconCalendar size={12} />}
                                title={
                                    <Group gap="xs">
                                        {event.ticker && (
                                            <Badge variant="outline" size="xs">{event.ticker}</Badge>
                                        )}
                                        <Text size="sm">{event.title || event.description}</Text>
                                    </Group>
                                }
                            >
                                <Text size="xs" c="dimmed">{event.date}</Text>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </>
            )}

            <Text size="xs" c="dimmed" ta="center" mt="md">
                💡 실적 발표 및 경제 지표 발표 일정은 주가에 큰 영향을 미칠 수 있습니다.
            </Text>
        </Card>
    );
}
