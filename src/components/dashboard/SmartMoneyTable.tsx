'use client';

import { Card, Table, Text, Badge, Group, Skeleton, ScrollArea, Modal, Stack, Divider, Title, Grid, Paper, Loader, Center } from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconCalendar, IconClock, IconChartLine, IconRobot, IconX } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import useSWR from 'swr';
import { useState } from 'react';
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
    const { data, error, isLoading } = useSWR(
        '/api/us/smart-money',
        fetcher,
        { refreshInterval: 300000 }
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
                    <Badge variant="light" color="blue" leftSection={<IconClock size={12} />}>
                        실시간 업데이트
                    </Badge>
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

                <Text size="xs" c="dimmed" mt="md" ta="center">
                    💡 종목을 클릭하면 AI 상세 분석을 확인할 수 있습니다
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
