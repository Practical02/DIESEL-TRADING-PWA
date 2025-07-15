"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type SaleStatus = 
  | "PENDING_LPO"
  | "LPO_RECEIVED"
  | "INVOICE_GENERATED"
  | "PARTIALLY_PAID"
  | "FULLY_PAID"
  | "CANCELLED";

type DashboardData = {
  monthlyProfits: {
    sale_date: string;
    profit: number;
  }[];
  yearlyStats: {
    totalQuantity: number;
    totalAmount: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
  };
  pendingLPOCount: number;
  pendingInvoiceCount: number;
  recentSales: {
    id: string;
    client: {
      name: string;
    };
    project: {
      name: string;
    };
    quantity: number;
    total_amount: number;
    status: SaleStatus;
    sale_date: string;
  }[];
  stockSummary: {
    totalQuantity: number;
  };
};

type ChartData = {
  month: string;
  profit: number;
};

const getStatusColor = (status: SaleStatus) => {
  switch (status) {
    case 'PENDING_LPO':
      return 'bg-yellow-100 text-yellow-800';
    case 'LPO_RECEIVED':
      return 'bg-blue-100 text-blue-800';
    case 'INVOICE_GENERATED':
      return 'bg-purple-100 text-purple-800';
    case 'PARTIALLY_PAID':
      return 'bg-orange-100 text-orange-800';
    case 'FULLY_PAID':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: SaleStatus) => {
  switch (status) {
    case 'PENDING_LPO':
      return '📋';
    case 'LPO_RECEIVED':
      return '📄';
    case 'INVOICE_GENERATED':
      return '🧾';
    case 'PARTIALLY_PAID':
      return '💰';
    case 'FULLY_PAID':
      return '✅';
    case 'CANCELLED':
      return '❌';
    default:
      return '📊';
  }
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching dashboard data:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-xl text-red-600 font-semibold">Failed to load dashboard data</div>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Transform monthly profits for the chart
  const chartData: ChartData[] = data.monthlyProfits.map(({ sale_date, profit }) => ({
    month: sale_date.split('T')[0].slice(0, 7), // Get YYYY-MM format
    profit,
  }));

  // Prepare pie chart data for sales breakdown
  const salesBreakdown = [
    { name: 'Revenue', value: data.yearlyStats.totalAmount, color: '#3b82f6' },
    { name: 'Cost', value: data.yearlyStats.totalCost, color: '#ef4444' },
    { name: 'Profit', value: data.yearlyStats.totalProfit, color: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your account overview</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-sm font-medium">{new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    AED {data.yearlyStats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="text-4xl opacity-80">💰</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Profit</p>
                  <p className="text-2xl font-bold">
                    AED {data.yearlyStats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-green-100 text-sm">
                    Margin: {data.yearlyStats.profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="text-4xl opacity-80">📈</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Cost</p>
                  <p className="text-2xl font-bold">
                    AED {data.yearlyStats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="text-4xl opacity-80">💸</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Volume Sold</p>
                  <p className="text-2xl font-bold">
                    {data.yearlyStats.totalQuantity.toLocaleString()} Gal
                  </p>
                </div>
                <div className="text-4xl opacity-80">⛽</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending LPOs</p>
                  <p className="text-3xl font-bold text-yellow-600">{data.pendingLPOCount}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending Invoices</p>
                  <p className="text-3xl font-bold text-blue-600">{data.pendingInvoiceCount}</p>
                </div>
                <div className="text-4xl">🧾</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Available Stock</p>
                  <p className="text-3xl font-bold text-green-600">
                    {data.stockSummary.totalQuantity.toLocaleString()} Gal
                  </p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Monthly Profit Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value: string) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                      stroke="#666"
                    />
                    <YAxis
                      tickFormatter={(value: number) =>
                        `${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`
                      }
                      stroke="#666"
                    />
                    <Tooltip
                      formatter={(value) => {
                        if (typeof value === 'number') {
                          return [`AED ${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, 'Profit'];
                        }
                        return [value, 'Profit'];
                      }}
                      labelFormatter={(label: string) => {
                        const [year, month] = label.split('-');
                        return `${month}/${year}`;
                      }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {salesBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `AED ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0 })}`,
                        'Amount'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getStatusIcon(sale.status)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sale.client.name}</h3>
                      <p className="text-sm text-gray-600">{sale.project.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.sale_date).toLocaleDateString()} • {sale.quantity.toLocaleString()} Gallons
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">
                      AED {sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                      {sale.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
