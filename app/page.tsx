'use client';

import { useEffect, useState } from 'react';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Clock, BarChart3, Globe } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/columns';
import { formatDistanceToNow } from 'date-fns';
import { LogDetailDrawer } from '@/components/log-detail-drawer';
import logData from '@/data/logs.json';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import type { LogData } from '@/types';

// Chart configs
const methodChartConfig = {
  GET: { color: 'hsl(var(--chart-1))', label: 'GET' },
  POST: { color: 'hsl(var(--chart-2))', label: 'POST' },
  PUT: { color: 'hsl(var(--chart-3))', label: 'PUT' },
  DELETE: { color: 'hsl(var(--chart-4))', label: 'DELETE' },
  PATCH: { color: 'hsl(var(--chart-5))', label: 'PATCH' },
};

const statusChartConfig = {
  '200': { color: 'hsl(var(--chart-2))', label: '200' },
  '400': { color: 'hsl(var(--chart-4))', label: '400' },
  '500': { color: 'hsl(var(--chart-3))', label: '500' },
};

const lineChartConfig = {
  value: { color: 'hsl(var(--chart-1))', label: 'Response Time' },
};

const barChartConfig = {
  value: { color: 'hsl(var(--chart-1))', label: 'Requests' },
};

const performanceChartConfig = {
  value: { color: 'hsl(var(--chart-2))', label: 'Response Time' },
};
const logs: LogData[] = logData as any;
export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Process the log data for visualization
  const processedData = {
    endpoints: {} as Record<string, number>,
    methods: {} as Record<string, number>,
    statusCodes: {} as Record<string, number>,
    responseTimesByEndpoint: {} as Record<string, number[]>,
    timelineData: [] as { timestamp: Date; endpoint: string; method: string; statusCode: number; responseTime: number }[],
    userAgents: {} as Record<string, number>,
  };

  logs.forEach((log) => {
    const endpoint = log.request.url.path;
    const method = log.request.method;
    const statusCode = log.response.status_code;
    const responseTime = log.response.time;
    const timestamp = new Date(log.timestamp);
    const userAgent = log.request.headers['user-agent'] || 'Unknown';

    // Count endpoints
    processedData.endpoints[endpoint] = (processedData.endpoints[endpoint] || 0) + 1;

    // Count methods
    processedData.methods[method] = (processedData.methods[method] || 0) + 1;

    // Count status codes
    processedData.statusCodes[statusCode] = (processedData.statusCodes[statusCode] || 0) + 1;

    // Track response times by endpoint
    if (!processedData.responseTimesByEndpoint[endpoint]) {
      processedData.responseTimesByEndpoint[endpoint] = [];
    }
    processedData.responseTimesByEndpoint[endpoint].push(responseTime);

    // Timeline data
    processedData.timelineData.push({
      timestamp,
      endpoint,
      method,
      statusCode,
      responseTime,
    });

    // User agents
    processedData.userAgents[userAgent] = (processedData.userAgents[userAgent] || 0) + 1;
  });

  // Prepare chart data
  const endpointChartData = Object.entries(processedData.endpoints)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value: count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const methodChartData = Object.entries(processedData.methods).map(([name, count]) => ({
    name,
    value: count,
    fill: methodChartConfig[name].color,
  }));

  const statusCodeChartData = Object.entries(processedData.statusCodes).map(([name, count], index) => ({
    name,
    value: count,
  }));

  // Calculate average response times by endpoint
  const avgResponseTimes = Object.entries(processedData.responseTimesByEndpoint)
    .map(([endpoint, times]) => {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      return {
        name: endpoint.length > 15 ? endpoint.substring(0, 15) + '...' : endpoint,
        value: avg,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Timeline data for line chart
  const timelineChartData = processedData.timelineData
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((item, index) => ({
      name: formatDistanceToNow(item.timestamp, { addSuffix: true }),
      value: item.responseTime,
    }))
    .slice(-20); // Show last 20 requests

  // Format for nanoseconds
  const formatNanoseconds = (value: number) => `${value.toFixed(2)} ns`;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Analytics Dashboard</h1>
          <p className="text-muted-foreground">Visualizing API traffic and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="ml-2">
            {logs.length} Requests
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(logs.length * 0.12)} from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.length > 0 ? (logs.reduce((sum, log) => sum + log.response.time, 0) / logs.length).toFixed(2) : 0} ns
            </div>
            <p className="text-xs text-muted-foreground">-12% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Endpoints</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(processedData.endpoints).length}</div>
            <p className="text-xs text-muted-foreground">+2 from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.length > 0
                ? ((logs.filter((log) => log.response.status_code < 400).length / logs.length) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">+0.5% from last period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Raw Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Request Methods</CardTitle>
                <CardDescription>Distribution of HTTP methods across all requests</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {logs.length > 0 && methodChartData.length > 0 ? (
                  <ChartContainer config={methodChartConfig} className="aspect-auto h-full w-full">
                    <PieChart>
                      <Pie
                        data={methodChartData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        label={({ payload, ...props }) => {
                          return (
                            <text
                              cx={props.cx}
                              cy={props.cy}
                              x={props.x}
                              y={props.y}
                              textAnchor={props.textAnchor}
                              dominantBaseline={props.dominantBaseline}
                              fill="hsla(var(--foreground))"
                            >
                              {payload.name}
                            </text>
                          );
                        }}
                      />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-2 flex-wrap gap-0 [&>*]:basis-1/5 [&>*]:justify-center"
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div>Loading or no data available</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status Codes</CardTitle>
                <CardDescription>Distribution of response status codes</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {logs.length > 0 && statusCodeChartData.length > 0 ? (
                  <ChartContainer config={statusChartConfig} className="aspect-auto h-full w-full">
                    <PieChart>
                      <Pie data={statusCodeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${value} responses`, 'Count']} />} />
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div>Loading or no data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Timeline</CardTitle>
              <CardDescription>Response times over the last 20 requests</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {logs.length > 0 && timelineChartData.length > 0 ? (
                <ChartContainer config={lineChartConfig} className="aspect-auto h-full w-full">
                  <LineChart data={timelineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis width={60} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="value" />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div>Loading or no data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints</CardTitle>
              <CardDescription>Most frequently accessed API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {logs.length > 0 && endpointChartData.length > 0 ? (
                <ChartContainer config={barChartConfig} className="aspect-auto h-full w-full">
                  <BarChart data={endpointChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`${value} requests`, 'Count']} />} />
                    <Bar dataKey="value" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div>Loading or no data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Times by Endpoint</CardTitle>
              <CardDescription>Average response time per endpoint (nanoseconds)</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {logs.length > 0 && avgResponseTimes.length > 0 ? (
                <ChartContainer config={performanceChartConfig} className="aspect-auto h-full w-full">
                  <BarChart data={avgResponseTimes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(value) => [formatNanoseconds(value), 'Avg. Response Time']} />}
                    />
                    <Bar dataKey="value" />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div>Loading or no data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Raw Log Data</CardTitle>
              <CardDescription>Detailed view of all API requests</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={logs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <LogDetailDrawer />
    </div>
  );
}
