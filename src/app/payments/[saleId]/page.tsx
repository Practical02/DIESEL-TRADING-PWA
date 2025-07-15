import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import PaymentForm from '@/components/forms/PaymentForm';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const { saleId } = await params;
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      client: true,
      project: true,
      payments: {
        orderBy: {
          payment_date: 'desc',
        },
      },
      lpo: {
        include: {
          invoice: true,
        },
      },
    },
  });

  if (!sale || !['INVOICE_GENERATED', 'PARTIALLY_PAID', 'FULLY_PAID'].includes(sale.status)) {
    notFound();
  }

  const totalPaid = sale.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingAmount = sale.total_amount - totalPaid;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Details</h1>
        <Link href="/payments">
          <Button variant="outline">← Back to Payments</Button>
        </Link>
      </div>

      {/* Sale Information */}
      <Card>
        <CardHeader>
          <CardTitle>Sale Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="font-medium">{sale.client.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Project</p>
              <p className="font-medium">{sale.project.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">LPO Number</p>
              <p className="font-medium">{sale.lpo?.lpo_no || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-medium">{sale.lpo?.invoice?.invoice_no || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold">AED {sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">AED {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-red-600">AED {remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Form */}
      {remainingAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentForm
              saleId={sale.id}
              clientId={sale.clientId}
              totalAmount={sale.total_amount}
              paidAmount={totalPaid}
            />
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {!sale.payments || sale.payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">💳 No payments recorded yet</div>
              <div className="text-sm">Payment history will appear here.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Method</th>
                    <th className="text-left py-3 px-4">Reference</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.payments?.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4">{payment.reference_no}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        AED {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">{payment.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 