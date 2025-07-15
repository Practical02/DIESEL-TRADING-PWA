"use client";

import { useState, useEffect } from "react";

type Sale = {
  id: string;
  total_amount: number;
  status: string;
  client: {
    name: string;
  };
  project: {
    name: string;
  };
  payments: {
    amount: number;
  }[];
};

type ReportRow = {
  client: string;
  project: string;
  total_amount: number;
  total_paid: number;
  pending_amount: number;
};

export default function PendingPaymentsReport() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/sales?include=payments,client,project');
      if (!response.ok) throw new Error('Failed to fetch sales');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading pending payments...</div>;
  }

  // Build report data
  const report: ReportRow[] = [];

  sales.forEach((sale) => {
    // Only include sales that are not fully paid or cancelled
    if (sale.status === 'FULLY_PAID' || sale.status === 'CANCELLED') {
      return;
    }

    const existing = report.find(
      (r) => r.client === sale.client.name && r.project === sale.project.name
    );

    const sale_total = sale.total_amount;
    const paid_amount = sale.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const pending_amount = sale_total - paid_amount;

    // Only add if there's actually a pending amount
    if (pending_amount > 0) {
      if (existing) {
        existing.total_amount += sale_total;
        existing.total_paid += paid_amount;
        existing.pending_amount += pending_amount;
      } else {
        report.push({
          client: sale.client.name,
          project: sale.project.name,
          total_amount: sale_total,
          total_paid: paid_amount,
          pending_amount: pending_amount,
        });
      }
    }
  });

  // Sort by pending amount descending
  report.sort((a, b) => b.pending_amount - a.pending_amount);

  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Client</th>
            <th className="p-2 text-left">Project</th>
            <th className="p-2 text-right">Total Invoiced (AED)</th>
            <th className="p-2 text-right">Payments Received (AED)</th>
            <th className="p-2 text-right">Pending (AED)</th>
          </tr>
        </thead>
        <tbody>
          {report.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                No pending payments found.
              </td>
            </tr>
          )}
          {report.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{r.client}</td>
              <td className="p-2">{r.project}</td>
              <td className="p-2 text-right">{r.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-2 text-right">{r.total_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-2 text-right text-red-600 font-semibold">
                {r.pending_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
