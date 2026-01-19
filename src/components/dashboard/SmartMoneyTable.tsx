'use client';

import { Card, Table, Text, Badge, Group, Skeleton, ScrollArea, Modal, Stack, Divider, Title, Grid, Paper, Loader, Center, Menu, ActionIcon, Tooltip } from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconCalendar, IconClock, IconChartLine, IconRobot, IconHistory, IconChevronDown } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import useSWR from 'swr';
import { useState, useEffect } from 'react';
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
    change_since_rec?: number;
    quant_score?: number;
    avg_vol_m?: number;
    liq_score?: number;
    gap_velocity?: number;
}

interface AIAnalysis {
    ticker: string;
    summary: string;
    news_count?: number;
    updated?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SmartMoneyTable() {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [historyDates, setHistoryDates] = useState<string[]>([]);

    // Fetch available history dates
    useEffect(() => {
        fetch('/api/us/history-dates')
            .then(res => res.json())
            .then(data => {
                if (data.dates && data.dates.length > 0) {
                    setHistoryDates(data.dates);
                }
            })
            .catch(console.error);
    }, []);

    // Determine which API endpoint to use
    const apiUrl = selectedDate
        ? `/api/us/history/${selectedDate}`
        : '/api/us/smart-money';

    const { data, error, isLoading } = useSWR(
        apiUrl,
        fetcher,
        { refreshInterval: selectedDate ? 0 : 300000 }
    );

    const [opened, { open, close }] = useDisclosure(false);
    const [selectedStock, setSelectedStock] = useState<Pick | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const handleStockClick = async (pick: Pick) => {
        setSelectedStock(pick);
        setAiAnalysis(null);
        setLoadingAI(true);
        open();

        try {
            const response = await fetch(`/api/us/ai-summary/${pick.ticker}`);
            const data = await response.json();
            setAiAnalysis(data);
        } catch (error) {
            console.error('Failed to fetch AI analysis:', error);
        } finally {
            setLoadingAI(false);
        }
    };

    if (isLoading) {
        return <Skeleton height={400} radius="md" />;
    }

    const picks: Pick[] = data?.top_picks || [];
    const analysisDate = data?.analysis_date || '';
    const analysisTimestamp = data?.analysis_timestamp || '';

    // Format the analysis date/time
    const formatDateTime = (dateStr: string, timestampStr: string) => {
        if (timestampStr) {
            try {
                const date = new Date(timestampStr);
                return date.toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return dateStr || '날짜 정보 없음';
            }
        }
        return dateStr || '날짜 정보 없음';
    };

    const formatDateShort = (dateStr: string) => {
        try {
            const [year, month, day] = dateStr.split('-');
            return `${month}/${day}`;
        } catch {
            return dateStr;
        }
    };

    const getBadgeColor = (rec: string) => {
        if (rec?.toLowerCase().includes('buy')) return 'teal';
        if (rec?.toLowerCase().includes('hold')) return 'yellow';
        return 'red';
    };

    return (
        <>
            <Card className="glass-card" padding="lg" radius="lg">
                <Group justify="space-between" mb="md">
                    <Group gap="md">
                        <Text size="lg" fw={600}>📋 Final Top 10 - Smart Money Picks</Text>
                        <Group gap={4}>
                            <IconCalendar size={14} color="gray" />
                            <Text size="xs" c="dimmed">
                                분석일: {formatDateTime(analysisDate, analysisTimestamp)}
                            </Text>
                        </Group>
                    </Group>

                    <Group gap="sm">
                        {/* History Date Selector */}
                        {historyDates.length > 0 && (
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <Tooltip label="과거 추천 비교" position="bottom">
                                        <ActionIcon
                                            variant={selectedDate ? "filled" : "light"}
                                            color={selectedDate ? "orange" : "gray"}
                                            size="lg"
                                        >
                                            <IconHistory size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Label>과거 분석일 선택</Menu.Label>
                                    <Menu.Item
                                        onClick={() => setSelectedDate(null)}
                                        c={!selectedDate ? 'blue' : undefined}
                                    >
                                        📊 현재 (실시간)
                                    </Menu.Item>
                                    <Menu.Divider />
                                    {historyDates.slice(0, 10).map(date => (
                                        <Menu.Item
                                            key={date}
                                            onClick={() => setSelectedDate(date)}
                                            c={selectedDate === date ? 'orange' : undefined}
                                        >
                                            📅 {date}
                                        </Menu.Item>
                                    ))}
                                </Menu.Dropdown>
                            </Menu>
                        )}

                        <Badge
                            variant="light"
                            color={selectedDate ? "orange" : "blue"}
                            leftSection={selectedDate ? <IconHistory size={12} /> : <IconClock size={12} />}
                        >
                            {selectedDate ? `${selectedDate} 기록` : "실시간 업데이트"}
                        </Badge>
                    </Group>
                </Group>

                {/* Historical comparison notice */}
                {selectedDate && (
                    <Paper
                        p="sm"
                        mb="md"
                        radius="md"
                        style={{
                            background: 'rgba(255, 165, 0, 0.1)',
                            border: '1px solid rgba(255, 165, 0, 0.3)'
                        }}
                    >
                        <Group gap="xs">
                            <IconHistory size={16} color="orange" />
                            <Text size="sm" c="orange">
                                <strong>{selectedDate}</strong> 분석 데이터를 보고 있습니다.
                                "현재가"는 오늘 기준이며, 당시 추천가와 비교할 수 있습니다.
                            </Text>
                        </Group>
                    </Paper>
                )}

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
                                <Table.Th style={{ textAlign: 'right' }}>
                                    {selectedDate ? '수익률' : '목표 UPSIDE'}
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {picks.slice(0, 10).map((pick, idx) => {
                                // For historical data, show actual performance
                                const displayChange = selectedDate
                                    ? pick.change_since_rec
                                    : pick.target_upside;

                                return (
                                    <Table.Tr
                                        key={pick.ticker}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleStockClick(pick)}
                                    >
                                        <Table.Td>
                                            <Text c="dimmed" size="sm">{idx + 1}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Text fw={600} c="blue" style={{ textDecoration: 'underline' }}>
                                                    {pick.ticker}
                                                </Text>
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
                                                {(displayChange || 0) >= 0 ? (
                                                    <IconArrowUp size={14} color={designTokens.colors.positive} />
                                                ) : (
                                                    <IconArrowDown size={14} color={designTokens.colors.negative} />
                                                )}
                                                <Text
                                                    fw={600}
                                                    c={(displayChange || 0) >= 0 ? 'teal' : 'red'}
                                                >
                                                    {(displayChange || 0) >= 0 ? '+' : ''}{displayChange?.toFixed(1)}%
                                                </Text>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                <Text size="xs" c="dimmed" mt="md" ta="center">
                    💡 종목을 클릭하면 AI 상세 분석을 확인할 수 있습니다
                    {historyDates.length > 0 && " | 🕐 히스토리 아이콘으로 과거 추천 비교"}
                </Text>
            </Card>

            {/* AI Analysis Modal */}
            <Modal
                opened={opened}
                onClose={close}
                size="xl"
                title={
                    <Group gap="md">
                        <IconRobot size={24} />
                        <Text fw={600} size="lg">
                            {selectedStock?.ticker} - AI 상세 분석
                        </Text>
                    </Group>
                }
                styles={{
                    content: {
                        background: 'rgba(20, 20, 30, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    },
                    header: {
                        background: 'transparent',
                    }
                }}
            >
                {selectedStock && (
                    <Stack gap="md">
                        {/* Stock Overview */}
                        <Grid>
                            <Grid.Col span={6}>
                                <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <Text size="xs" c="dimmed">종목명</Text>
                                    <Text fw={600}>{selectedStock.name}</Text>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <Text size="xs" c="dimmed">섹터</Text>
                                    <Badge variant="outline">{selectedStock.sector}</Badge>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={3}>
                                <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <Text size="xs" c="dimmed">AI 점수</Text>
                                    <Text fw={700} size="xl" c="blue">{selectedStock.final_score?.toFixed(1)}</Text>
                                </Paper>
                            </Grid.Col>
                        </Grid>

                        {/* Price Info */}
                        <Grid>
                            <Grid.Col span={4}>
                                <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <Text size="xs" c="dimmed">추천가</Text>
                                    <Text fw={600} size="lg">${selectedStock.price_at_rec?.toFixed(2)}</Text>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <Text size="xs" c="dimmed">현재가</Text>
                                    <Text fw={600} size="lg">${selectedStock.current_price?.toFixed(2)}</Text>
                                </Paper>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <Text size="xs" c="dimmed">목표 상승률</Text>
                                    <Text fw={600} size="lg" c={selectedStock.target_upside >= 0 ? 'teal' : 'red'}>
                                        {selectedStock.target_upside >= 0 ? '+' : ''}{selectedStock.target_upside?.toFixed(1)}%
                                    </Text>
                                </Paper>
                            </Grid.Col>
                        </Grid>

                        {/* Quant Metrics */}
                        {(selectedStock.quant_score || selectedStock.avg_vol_m) && (
                            <Grid>
                                <Grid.Col span={3}>
                                    <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <Text size="xs" c="dimmed">Quant 점수</Text>
                                        <Text fw={600}>{selectedStock.quant_score?.toFixed(1) || '-'}</Text>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <Text size="xs" c="dimmed">평균 거래량</Text>
                                        <Text fw={600}>{selectedStock.avg_vol_m?.toFixed(1)}M</Text>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <Text size="xs" c="dimmed">유동성 점수</Text>
                                        <Text fw={600}>{selectedStock.liq_score || '-'}</Text>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <Text size="xs" c="dimmed">Gap Velocity</Text>
                                        <Text fw={600}>{selectedStock.gap_velocity?.toFixed(2) || '-'}</Text>
                                    </Paper>
                                </Grid.Col>
                            </Grid>
                        )}

                        <Divider />

                        {/* AI Analysis Content */}
                        <Title order={5}>🤖 AI 분석 리포트</Title>

                        {loadingAI ? (
                            <Center py="xl">
                                <Stack align="center" gap="md">
                                    <Loader type="dots" />
                                    <Text c="dimmed">AI 분석 로딩 중...</Text>
                                </Stack>
                            </Center>
                        ) : aiAnalysis?.summary ? (
                            <Paper p="md" radius="md" style={{ background: 'rgba(0,100,255,0.05)', border: '1px solid rgba(0,100,255,0.2)' }}>
                                <Text
                                    size="sm"
                                    style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                                    dangerouslySetInnerHTML={{
                                        __html: aiAnalysis.summary
                                            .replace(/##\s*(.*)/g, '<strong style="font-size: 1.1em; display: block; margin: 12px 0 8px 0;">$1</strong>')
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\n/g, '<br/>')
                                    }}
                                />
                            </Paper>
                        ) : (
                            <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <Text c="dimmed" ta="center">
                                    {selectedStock.ticker}에 대한 AI 분석 데이터가 아직 없습니다.
                                    <br />
                                    다음 자동 업데이트 후 확인해주세요.
                                </Text>
                            </Paper>
                        )}

                        <Text size="xs" c="dimmed" ta="center">
                            ⚠️ AI 분석은 참고용이며, 투자 결정의 근거로만 사용하지 마세요.
                        </Text>
                    </Stack>
                )}
            </Modal>
        </>
    );
}
