'use client';

import { Card, Text, Group, Badge, Stack, Progress, SimpleGrid, Skeleton, Box, Alert, ThemeIcon, Tooltip } from '@mantine/core';
import { IconClock, IconTrendingUp, IconCheck, IconX, IconAlertCircle, IconVolume, IconChartLine, IconTarget } from '@tabler/icons-react';
import useSWR from 'swr';
import { designTokens } from '@/lib/theme';

interface Recommendation {
    rank: number;
    ticker: string;
    company: string;
    sector: string;
    current_price: number;
    nice_score: number;
    confidence: number;
    closing_bell_passed: number;
    key_news: string[];
    checks: {
        volume: boolean;
        price: boolean;
        ma: boolean;
        resistance: boolean;
        pattern: boolean;
        volume_ratio?: number;
        price_ratio?: number;
    };
}

interface ClosingBellData {
    status: string;
    message: string;
    count: number;
    recommendations: Recommendation[];
    current_time?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function ConditionBadge({ passed, label }: { passed: boolean; label: string }) {
    return (
        <Tooltip label={label}>
            <Badge
                size="xs"
                variant={passed ? 'filled' : 'outline'}
                color={passed ? 'teal' : 'gray'}
                leftSection={passed ? <IconCheck size={10} /> : <IconX size={10} />}
            >
                {label}
            </Badge>
        </Tooltip>
    );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
    const confidenceColor = rec.confidence >= 0.85 ? 'teal' : rec.confidence >= 0.7 ? 'yellow' : 'orange';

    return (
        <Card className="glass-card" padding="lg" radius="lg">
            <Group justify="space-between" mb="md">
                <Group gap="xs">
                    <Badge size="lg" variant="filled" color="blue" circle>
                        {rec.rank}
                    </Badge>
                    <Box>
                        <Text size="xl" fw={700}>{rec.ticker}</Text>
                        <Text size="xs" c="dimmed">{rec.company}</Text>
                    </Box>
                </Group>
                <Badge variant="light" color="grape">{rec.sector}</Badge>
            </Group>

            <SimpleGrid cols={2} spacing="xs" mb="md">
                <Box>
                    <Text size="xs" c="dimmed">현재가</Text>
                    <Text fw={600}>${rec.current_price?.toFixed(2)}</Text>
                </Box>
                <Box>
                    <Text size="xs" c="dimmed">NICE Score</Text>
                    <Text fw={600} c={rec.nice_score >= 90 ? 'teal' : 'blue'}>{rec.nice_score}</Text>
                </Box>
            </SimpleGrid>

            <Box mb="md">
                <Group justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed">신뢰도</Text>
                    <Text size="xs" fw={600} c={confidenceColor}>{(rec.confidence * 100).toFixed(0)}%</Text>
                </Group>
                <Progress value={rec.confidence * 100} color={confidenceColor} size="sm" radius="xl" />
            </Box>

            <Box mb="md">
                <Text size="xs" c="dimmed" mb="xs">통과 조건 ({rec.closing_bell_passed}/5)</Text>
                <Group gap={4}>
                    <ConditionBadge passed={rec.checks?.volume} label="거래량" />
                    <ConditionBadge passed={rec.checks?.price} label="종가위치" />
                    <ConditionBadge passed={rec.checks?.ma} label="이평선" />
                    <ConditionBadge passed={rec.checks?.resistance} label="저항돌파" />
                    <ConditionBadge passed={rec.checks?.pattern} label="캔들형태" />
                </Group>
            </Box>

            {rec.key_news && rec.key_news.length > 0 && (
                <Box>
                    <Text size="xs" c="dimmed" mb="xs">최신 뉴스</Text>
                    <Text size="xs" lineClamp={2}>{rec.key_news[0]}</Text>
                </Box>
            )}
        </Card>
    );
}

export default function ClosingBellTab() {
    const { data, isLoading, error } = useSWR<ClosingBellData>(
        '/api/us/closing-bell',
        fetcher,
        { refreshInterval: 60000 }
    );

    if (isLoading) {
        return (
            <Stack gap="md">
                <Skeleton height={100} radius="md" />
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    <Skeleton height={300} radius="md" />
                    <Skeleton height={300} radius="md" />
                    <Skeleton height={300} radius="md" />
                </SimpleGrid>
            </Stack>
        );
    }

    // Not trading time
    if (data?.status === 'not_time') {
        return (
            <Card className="glass-card" padding="xl" radius="lg">
                <Group justify="center" mb="md">
                    <ThemeIcon size={60} radius="xl" variant="light" color="blue">
                        <IconClock size={30} />
                    </ThemeIcon>
                </Group>
                <Text ta="center" size="xl" fw={700} mb="xs">Closing Bell Bet</Text>
                <Text ta="center" c="dimmed" mb="md">{data.message}</Text>
                <Text ta="center" size="sm" c="blue">
                    ⏰ 14:45 - 16:00 EST (한국시간 03:45 - 05:00)
                </Text>
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Trading Window"
                    color="blue"
                    mt="lg"
                    variant="light"
                >
                    미국 장 마감 15분 전에 최적의 종가배팅 종목이 자동으로 추천됩니다.
                </Alert>
            </Card>
        );
    }

    // No recommendations
    if (data?.status === 'NO_RECOMMENDATIONS' || !data?.recommendations?.length) {
        return (
            <Card className="glass-card" padding="xl" radius="lg">
                <Group justify="center" mb="md">
                    <ThemeIcon size={60} radius="xl" variant="light" color="orange">
                        <IconAlertCircle size={30} />
                    </ThemeIcon>
                </Group>
                <Text ta="center" size="xl" fw={700} mb="xs">추천 종목 없음</Text>
                <Text ta="center" c="dimmed">
                    현재 5조건을 충족하는 종목이 없습니다.
                </Text>
            </Card>
        );
    }

    // Success - Show recommendations
    return (
        <Stack gap="lg">
            {/* Header */}
            <Card className="glass-card" padding="lg" radius="lg">
                <Group justify="space-between">
                    <Group gap="md">
                        <ThemeIcon size={40} radius="xl" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                            <IconTrendingUp size={24} />
                        </ThemeIcon>
                        <Box>
                            <Text size="lg" fw={700}>Closing Bell Recommendations</Text>
                            <Text size="sm" c="dimmed">종가배팅 추천 {data.count}개 종목</Text>
                        </Box>
                    </Group>
                    <Badge size="lg" variant="filled" color="teal">
                        {data.count} Picks
                    </Badge>
                </Group>
            </Card>

            {/* Recommendation Cards */}
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                {data.recommendations.map((rec) => (
                    <RecommendationCard key={rec.ticker} rec={rec} />
                ))}
            </SimpleGrid>

            {/* Legend */}
            <Card className="glass-card" padding="md" radius="lg">
                <Text size="xs" c="dimmed" mb="xs">5조건 설명</Text>
                <Group gap="lg">
                    <Group gap={4}>
                        <IconVolume size={14} />
                        <Text size="xs">거래량: 전일 150%↑</Text>
                    </Group>
                    <Group gap={4}>
                        <IconTarget size={14} />
                        <Text size="xs">종가위치: 고점 90%↑</Text>
                    </Group>
                    <Group gap={4}>
                        <IconChartLine size={14} />
                        <Text size="xs">이평선: 종가 {'>'} MA20 {'>'} MA60</Text>
                    </Group>
                </Group>
            </Card>
        </Stack>
    );
}
