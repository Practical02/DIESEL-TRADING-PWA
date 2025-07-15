"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Sale = {
  id: string;
  client: {
    name: string;
  };
  project: {
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_amount: number;
  lpo: {
    id: string;
    lpo_no: string;
    lpo_date: string;
    status: string;
  } | null;
  invoice: {
    id: string;
    invoice_no: string;
    invoice_date: string;
    status: string;
  } | null;
  status: string;
  sale_date: string;
};

export default function Invoices() {
  const router = useRouter();
  const [pendingInvoices, setPendingInvoices] = useState<Sale[]>([]);
  const [issuedInvoices, setIssuedInvoices] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Fetch sales with their LPOs and invoices
      const response = await fetch('/api/sales?include=lpo,invoice');
      if (!response.ok) throw new Error('Failed to fetch sales');
      const data = await response.json();

      // Filter sales that need invoices (have LPO but no invoice)
      const pending = data.filter((sale: Sale) => 
        sale.lpo && 
        sale.lpo.status === 'INVOICE_PENDING' && 
        !sale.invoice
      );
      setPendingInvoices(pending);

      // Filter sales that have invoices
      const issued = data.filter((sale: Sale) => sale.invoice !== null);
      setIssuedInvoices(issued);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching invoices:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>

      {/* Pending Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Project</th>
                  <th className="text-left py-3 px-4">LPO No</th>
                  <th className="text-right py-3 px-4">Quantity</th>
                  <th className="text-right py-3 px-4">Unit Price</th>
                  <th className="text-right py-3 px-4">Total Amount</th>
                  <th className="text-right py-3 px-4">LPO Date</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="py-3 px-4">{sale.client.name}</td>
                    <td className="py-3 px-4">{sale.project.name}</td>
                    <td className="py-3 px-4">{sale.lpo?.lpo_no}</td>
                    <td className="py-3 px-4 text-right">{sale.quantity.toLocaleString()} L</td>
                    <td className="py-3 px-4 text-right">
                      AED {sale.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      AED {sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sale.lpo ? new Date(sale.lpo.lpo_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/sales/lpo/${sale.lpo?.id}/invoice`)}
                      >
                        Generate Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
                {pendingInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      No pending invoices
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Issued Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Project</th>
                  <th className="text-left py-3 px-4">Invoice No</th>
                  <th className="text-right py-3 px-4">Quantity</th>
                  <th className="text-right py-3 px-4">Total Amount</th>
                  <th className="text-right py-3 px-4">Invoice Date</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {issuedInvoices.map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="py-3 px-4">{sale.client.name}</td>
                    <td className="py-3 px-4">{sale.project.name}</td>
                    <td className="py-3 px-4">{sale.invoice?.invoice_no}</td>
                    <td className="py-3 px-4 text-right">{sale.quantity.toLocaleString()} L</td>
                    <td className="py-3 px-4 text-right">
                      AED {sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sale.invoice ? new Date(sale.invoice.invoice_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          sale.invoice?.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {sale.invoice?.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {issuedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      No invoices issued yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
