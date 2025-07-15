"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types/sale";

type SalesTableProps = {
  sales: Sale[];
  onEdit?: (sale: Sale) => void;
  onDelete?: (id: string) => void;
};

export default function SalesTable({ sales, onEdit, onDelete }: SalesTableProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!onDelete || !window.confirm('Are you sure you want to delete this sale?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/sales?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete sale');
      }

      onDelete(id);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.error('Error deleting sale:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PENDING_LPO: 'bg-yellow-100 text-yellow-800',
      LPO_RECEIVED: 'bg-blue-100 text-blue-800',
      INVOICE_GENERATED: 'bg-purple-100 text-purple-800',
      PARTIALLY_PAID: 'bg-orange-100 text-orange-800',
      FULLY_PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-AE', {
      style: 'currency',
      currency: 'AED',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LPO Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity.toLocaleString()} L</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(sale.unit_price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(sale.total_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                      {sale.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.lpo_no ? (
                      <>
                        <div>LPO: {sale.lpo_no}</div>
                        <div>Date: {sale.lpo_date && formatDate(sale.lpo_date)}</div>
                      </>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.invoice_no ? (
                      <>
                        <div>Invoice: {sale.invoice_no}</div>
                        <div>Date: {sale.invoice_date && formatDate(sale.invoice_date)}</div>
                      </>
                    ) : (
                      <span className="text-gray-500">Not Generated</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>Paid: {formatCurrency(sale.paid_amount)}</div>
                    <div>Remaining: {formatCurrency(sale.remaining_amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {onEdit && (
                      <Button
                        onClick={() => onEdit(sale)}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        onClick={() => handleDelete(sale.id)}
                        disabled={isLoading || sale.paid_amount > 0}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
