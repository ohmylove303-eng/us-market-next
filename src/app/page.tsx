'use client';

import { Container, Title, Group, Badge, Box, SimpleGrid, SegmentedControl, Text, Tabs, rem } from '@mantine/core';
import { IconBrandApple, IconChartLine, IconClock, IconTrendingUp, IconActivity, IconTargetArrow } from '@tabler/icons-react';
import { useState } from 'react';
import {
  MarketIndices,
  SmartMoneyTable,
  ETFFlows,
  MarketMap,
  StockChart,
  PerformanceTab
} from '@/components/dashboard';
import ClosingBellTab from '@/components/dashboard/ClosingBellTab';

export default function Dashboard() {
  const [market, setMarket] = useState('us');
  const [activeTab, setActiveTab] = useState<string | null>('dashboard');

  const iconStyle = { width: rem(16), height: rem(16) };

  return (
    <Box className="gradient-bg" style={{ minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header */}
      <Box
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container size="xl" py="md">
          <Group justify="space-between">
            <Group gap="md">
              <IconBrandApple size={28} color="#f5f5f7" />
              <Title order={3} c="white" fw={600}>
                US Market Dashboard
              </Title>
              <Badge variant="light" color="blue" size="sm">LIVE</Badge>
            </Group>

            <Group gap="md">
              <SegmentedControl
                value={market}
                onChange={setMarket}
                data={[
                  { label: '🇰🇷 KR Market', value: 'kr' },
                  { label: '🇺🇸 US Market', value: 'us' },
                ]}
                size="xs"
              />
              <Text size="xs" c="dimmed">
                {new Date().toLocaleString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Tab Navigation */}
      <Container size="xl" pt="md">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="dashboard" leftSection={<IconChartLine style={iconStyle} />}>
              Dashboard
            </Tabs.Tab>
            <Tabs.Tab value="closing-bell" leftSection={<IconClock style={iconStyle} />}>
              Closing Bell
            </Tabs.Tab>
            <Tabs.Tab value="performance" leftSection={<IconTargetArrow style={iconStyle} />}>
              Performance
            </Tabs.Tab>
            <Tabs.Tab value="momentum" leftSection={<IconTrendingUp style={iconStyle} />} disabled>
              Momentum
            </Tabs.Tab>
            <Tabs.Tab value="options" leftSection={<IconActivity style={iconStyle} />} disabled>
              Options Flow
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Container>

      {/* Main Content */}
      <Container size="xl" py="lg">
        {activeTab === 'dashboard' && (
          <>
            {/* Market Indices */}
            <MarketIndices />

            {/* Chart + Market Map */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="lg">
              <StockChart defaultTicker="AAPL" />
              <MarketMap />
            </SimpleGrid>

            {/* Smart Money Table */}
            <Box mb="lg">
              <SmartMoneyTable />
            </Box>

            {/* ETF Flows */}
            <ETFFlows />
          </>
        )}

        {activeTab === 'closing-bell' && (
          <ClosingBellTab />
        )}

        {activeTab === 'performance' && (
          <PerformanceTab />
        )}

        {activeTab === 'momentum' && (
          <Box py="xl">
            <Text ta="center" c="dimmed">Coming Soon</Text>
          </Box>
        )}

        {activeTab === 'options' && (
          <Box py="xl">
            <Text ta="center" c="dimmed">Coming Soon</Text>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box py="xl" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container size="xl">
          <Group justify="center">
            <Text size="xs" c="dimmed">
              © 2025 US Market Dashboard | Powered by Next.js + Mantine
            </Text>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
