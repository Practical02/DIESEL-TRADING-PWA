"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Sale = {
  id: string;
  quantity: number;
  purchase_cost: number;
  unit_price: number;
  total_amount: number;
  total_profit: number;
  sale_date: string;
  client: {
    name: string;
  };
  stock: {
    supplier: string;
  };
};

type ProfitSummary = {
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  totalQuantity: number;
  averageProfit: number;
  profitMargin: number;
};

export default function ProfitLossPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSales();
  }, [dateRange]);

  const fetchSales = async () => {
    try {
      const response = await fetch(`/api/sales?start=${dateRange.start}&end=${dateRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch sales');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = (): ProfitSummary => {
    const summary = sales.reduce((acc, sale) => {
      acc.totalSales += sale.total_amount;
      acc.totalCost += sale.quantity * sale.purchase_cost;
      acc.totalProfit += sale.total_profit;
      acc.totalQuantity += sale.quantity;
      return acc;
    }, {
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
      totalQuantity: 0,
      averageProfit: 0,
      profitMargin: 0,
    });

    summary.averageProfit = summary.totalQuantity ? summary.totalProfit / summary.totalQuantity : 0;
    summary.profitMargin = summary.totalSales ? (summary.totalProfit / summary.totalSales) * 100 : 0;

    return summary;
  };

  const summary = calculateSummary();

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profit & Loss Report</h1>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">AED {summary.totalSales.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total volume: {summary.totalQuantity.toLocaleString()} L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">AED {summary.totalProfit.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              Margin: {summary.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">AED {summary.averageProfit.toFixed(2)}/L</p>
            <p className="text-sm text-muted-foreground">
              Total cost: AED {summary.totalCost.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Client</th>
                  <th className="text-left py-2">Supplier</th>
                  <th className="text-right py-2">Quantity (L)</th>
                  <th className="text-right py-2">Cost/L</th>
                  <th className="text-right py-2">Price/L</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-right py-2">Profit</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="py-2">{new Date(sale.sale_date).toLocaleDateString()}</td>
                    <td className="py-2">{sale.client.name}</td>
                    <td className="py-2">{sale.stock.supplier}</td>
                    <td className="text-right py-2">{sale.quantity.toLocaleString()}</td>
                    <td className="text-right py-2">AED {sale.purchase_cost.toFixed(2)}</td>
                    <td className="text-right py-2">AED {sale.unit_price.toFixed(2)}</td>
                    <td className="text-right py-2">AED {sale.total_amount.toLocaleString()}</td>
                    <td className="text-right py-2 text-green-600">
                      AED {sale.total_profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
