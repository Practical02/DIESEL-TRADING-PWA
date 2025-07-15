"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  status: string;
  sale_date: string;
  remarks?: string;
  lpo?: {
    id: string;
    lpo_no: string;
    lpo_date: string;
    invoice?: {
      id: string;
      invoice_no: string;
      invoice_date: string;
    };
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING_LPO':
      return 'bg-yellow-500';
    case 'LPO_RECEIVED':
      return 'bg-blue-500';
    case 'INVOICE_GENERATED':
      return 'bg-purple-500';
    case 'PARTIALLY_PAID':
      return 'bg-orange-500';
    case 'FULLY_PAID':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING_LPO':
      return 'Pending LPO';
    case 'LPO_RECEIVED':
      return 'LPO Received';
    case 'INVOICE_GENERATED':
      return 'Invoice Generated';
    case 'PARTIALLY_PAID':
      return 'Partially Paid';
    case 'FULLY_PAID':
      return 'Fully Paid';
    default:
      return status;
  }
};

const getNextAction = (status: string) => {
  switch (status) {
    case 'PENDING_LPO':
      return 'Awaiting LPO from client';
    case 'LPO_RECEIVED':
      return 'Generate invoice';
    case 'INVOICE_GENERATED':
      return 'Collect payment';
    case 'PARTIALLY_PAID':
      return 'Collect remaining payment';
    case 'FULLY_PAID':
      return 'Sale completed';
    default:
      return 'Unknown status';
  }
};

export default function SalesPage() {
  const router = useRouter();
  const [pendingLPO, setPendingLPO] = useState<Sale[]>([]);
  const [readyForInvoice, setReadyForInvoice] = useState<Sale[]>([]);
  const [invoiced, setInvoiced] = useState<Sale[]>([]);
  const [completed, setCompleted] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch all sales with their relations
      const allSalesRes = await fetch('/api/sales?include=lpo,invoice');
      
      if (!allSalesRes.ok) {
        throw new Error(`Failed to fetch sales: ${allSalesRes.status}`);
      }
      
      const allSales = await allSalesRes.json();

      // Validate that we got an array
      if (!Array.isArray(allSales)) {
        console.error('API returned non-array response:', allSales);
        throw new Error('Invalid API response format');
      }

      // Categorize sales by status
      const pendingLPOSales = allSales.filter((sale: Sale) => sale.status === 'PENDING_LPO');
      const readyForInvoiceSales = allSales.filter((sale: Sale) => sale.status === 'LPO_RECEIVED');
      const invoicedSales = allSales.filter((sale: Sale) => 
        ['INVOICE_GENERATED', 'PARTIALLY_PAID'].includes(sale.status)
      );
      const completedSales = allSales.filter((sale: Sale) => sale.status === 'FULLY_PAID');

      setPendingLPO(pendingLPOSales);
      setReadyForInvoice(readyForInvoiceSales);
      setInvoiced(invoicedSales);
      setCompleted(completedSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      // Set empty arrays on error
      setPendingLPO([]);
      setReadyForInvoice([]);
      setInvoiced([]);
      setCompleted([]);
    } finally {
      setIsLoading(false);
    }
  };

  const SaleCard = ({ sale }: { sale: Sale }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${getStatusColor(sale.status)}`}></span>
              <span className="font-medium text-sm">{getStatusText(sale.status)}</span>
            </div>
            <h3 className="font-semibold text-lg">{sale.client.name}</h3>
            <p className="text-gray-600">{sale.project.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              AED {sale.total_amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {sale.quantity.toLocaleString()} gallons
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Sale Date:</span>
            <p className="font-medium">{new Date(sale.sale_date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Unit Price:</span>
            <p className="font-medium">AED {sale.unit_price.toFixed(2)}</p>
          </div>
          {sale.lpo && (
            <>
              <div>
                <span className="text-gray-500">LPO No:</span>
                <p className="font-medium">{sale.lpo.lpo_no}</p>
              </div>
              <div>
                <span className="text-gray-500">LPO Date:</span>
                <p className="font-medium">{new Date(sale.lpo.lpo_date).toLocaleDateString()}</p>
              </div>
            </>
          )}
          {sale.lpo?.invoice && (
            <>
              <div>
                <span className="text-gray-500">Invoice No:</span>
                <p className="font-medium">{sale.lpo.invoice.invoice_no}</p>
              </div>
              <div>
                <span className="text-gray-500">Invoice Date:</span>
                <p className="font-medium">{new Date(sale.lpo.invoice.invoice_date).toLocaleDateString()}</p>
              </div>
            </>
          )}
        </div>

        {sale.remarks && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{sale.remarks}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Next:</span> {getNextAction(sale.status)}
          </div>
          <div className="flex gap-2">
            {sale.status === 'PENDING_LPO' && (
              <Button 
                onClick={() => router.push(`/sales/${sale.id}/lpo`)}
                className="bg-yellow-600 hover:bg-yellow-700"
                size="sm"
              >
                Add LPO
              </Button>
            )}
                         {sale.status === 'LPO_RECEIVED' && sale.lpo && (
               <Button 
                 onClick={() => router.push(`/sales/lpo/${sale.lpo!.id}/invoice`)}
                 className="bg-blue-600 hover:bg-blue-700"
                 size="sm"
               >
                 Generate Invoice
               </Button>
             )}
            {['INVOICE_GENERATED', 'PARTIALLY_PAID'].includes(sale.status) && (
              <Button 
                onClick={() => router.push(`/payments/${sale.id}`)}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                Manage Payments
              </Button>
            )}
            {sale.status === 'FULLY_PAID' && (
              <Button 
                onClick={() => router.push(`/payments/${sale.id}`)}
                variant="outline"
                size="sm"
              >
                View Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-lg">Loading sales...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Management</h1>
        <Button 
          onClick={() => router.push('/sales/new')} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          + New Sale
        </Button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Sales Workflow</h2>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="font-medium">Pending LPO</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-medium">Ready for Invoice</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="font-medium">Invoiced</span>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium">Completed</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending_lpo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending_lpo" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Pending LPO ({pendingLPO.length})
          </TabsTrigger>
          <TabsTrigger value="ready_invoice" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Ready for Invoice ({readyForInvoice.length})
          </TabsTrigger>
          <TabsTrigger value="invoiced" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Invoiced ({invoiced.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending_lpo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Pending LPO - Awaiting Client LPO
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLPO.length > 0 ? (
                pendingLPO.map((sale) => <SaleCard key={sale.id} sale={sale} />)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">📋 No pending LPOs</div>
                  <div className="text-sm">Create a new sale to get started.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ready_invoice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Ready for Invoice - LPO Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readyForInvoice.length > 0 ? (
                readyForInvoice.map((sale) => <SaleCard key={sale.id} sale={sale} />)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">📄 No sales ready for invoice</div>
                  <div className="text-sm">Sales with LPO received will appear here.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoiced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Invoiced - Ready for Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoiced.length > 0 ? (
                invoiced.map((sale) => <SaleCard key={sale.id} sale={sale} />)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">🧾 No invoiced sales</div>
                  <div className="text-sm">Sales with generated invoices will appear here.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Completed - Fully Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completed.length > 0 ? (
                completed.map((sale) => <SaleCard key={sale.id} sale={sale} />)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">✅ No completed sales yet</div>
                  <div className="text-sm">Fully paid sales will appear here.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
