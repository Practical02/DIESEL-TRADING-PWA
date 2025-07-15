"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Payment = {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_no: string;
  remarks: string | null;
};

type Invoice = {
  id: string;
  invoice_no: string;
  invoice_date: string;
  status: string;
  remarks: string | null;
  lpo: {
    id: string;
    lpo_no: string;
    sale: {
      id: string;
      client: {
        id: string;
        name: string;
      };
      project: {
        id: string;
        name: string;
      };
      quantity: number;
      total_amount: number;
      status: string;
      payments: Payment[];
    };
  };
};

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoice');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  // Group invoices by payment status
  const pendingInvoices = invoices.filter(invoice => 
    ['INVOICE_GENERATED', 'PARTIALLY_PAID'].includes(invoice.lpo.sale.status)
  );
  const paidInvoices = invoices.filter(invoice => 
    invoice.lpo.sale.status === 'FULLY_PAID'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <div className="text-sm text-gray-600">
          Pending: {pendingInvoices.length} | Completed: {paidInvoices.length}
        </div>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Project</th>
                  <th className="text-left py-3 px-4">LPO No</th>
                  <th className="text-left py-3 px-4">Invoice No</th>
                  <th className="text-right py-3 px-4">Total Amount</th>
                  <th className="text-right py-3 px-4">Paid Amount</th>
                  <th className="text-right py-3 px-4">Remaining</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((invoice) => {
                  const sale = invoice.lpo.sale;
                  const paidAmount = sale.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                  const remainingAmount = sale.total_amount - paidAmount;

                  return (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{sale.client.name}</td>
                      <td className="py-3 px-4">{sale.project.name}</td>
                      <td className="py-3 px-4">{invoice.lpo.lpo_no}</td>
                      <td className="py-3 px-4">{invoice.invoice_no}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        AED {sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        AED {paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-red-600">
                        AED {remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            sale.status === 'PARTIALLY_PAID'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sale.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/payments/${sale.id}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Add Payment
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {pendingInvoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="text-lg mb-2">🎉 No pending payments!</div>
                        <div className="text-sm">All invoices have been paid.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Completed Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completed Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Project</th>
                  <th className="text-left py-3 px-4">LPO No</th>
                  <th className="text-left py-3 px-4">Invoice No</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-center py-3 px-4">Invoice Date</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">View</th>
                </tr>
              </thead>
              <tbody>
                {paidInvoices.map((invoice) => {
                  const sale = invoice.lpo.sale;
                  return (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{sale.client.name}</td>
                      <td className="py-3 px-4">{sale.project.name}</td>
                      <td className="py-3 px-4">{invoice.lpo.lpo_no}</td>
                      <td className="py-3 px-4">{invoice.invoice_no}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        AED {sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          FULLY PAID
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link href={`/payments/${sale.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {paidInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="text-lg mb-2">📋 No completed payments yet</div>
                        <div className="text-sm">Completed payments will appear here.</div>
                      </div>
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
