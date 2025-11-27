export enum AppView {
  DASHBOARD = 'DASHBOARD',
  AUTOMATION = 'AUTOMATION',
  CHAT = 'CHAT'
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: string;
}

export interface GeneratedDashboard {
  title: string;
  summary: string;
  metrics: DashboardMetric[];
  charts: {
    title: string;
    type: 'bar' | 'line' | 'area';
    data: ChartDataPoint[];
    xAxisKey: string;
    dataKey: string;
  }[];
}

export interface AutomationResult {
  step: string;
  output: string;
  status: 'pending' | 'success' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}
