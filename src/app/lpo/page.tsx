"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
};

type LPO = {
  id: string;
  sale: Sale;
  lpo_no: string;
  lpo_date: string;
  status: string;
  remarks?: string;
  invoice?: {
    id: string;
    invoice_no: string;
    invoice_date: string;
    status: string;
  };
};

export default function LPOPage() {
  const router = useRouter();
  const [pendingLPOs, setPendingLPOs] = useState<Sale[]>([]);
  const [activeLPOs, setActiveLPOs] = useState<LPO[]>([]);
  const [completedLPOs, setCompletedLPOs] = useState<LPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch sales that need LPO
      const salesResponse = await fetch('/api/sales?status=PENDING_LPO');
      const salesData = await salesResponse.json();
      setPendingLPOs(salesData);

      // Fetch LPOs
      const lpoResponse = await fetch('/api/lpo?include=invoice');
      const lpoData = await lpoResponse.json();

      // Split LPOs into active and completed
      const active = lpoData.filter((lpo: LPO) => lpo.status === 'INVOICE_PENDING');
      const completed = lpoData.filter((lpo: LPO) => lpo.status === 'COMPLETED');

      setActiveLPOs(active);
      setCompletedLPOs(completed);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const SaleCard = ({ sale }: { sale: Sale }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Client</p>
            <p className="text-lg">{sale.client.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Project</p>
            <p className="text-lg">{sale.project.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Quantity</p>
            <p className="text-lg">{sale.quantity.toLocaleString()} Gallons</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Amount</p>
            <p className="text-lg">AED {sale.total_amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Sale Date</p>
            <p className="text-lg">{new Date(sale.sale_date).toLocaleDateString()}</p>
          </div>
        </div>
        {sale.remarks && (
          <div className="mt-4">
            <p className="text-sm font-medium">Remarks</p>
            <p className="text-gray-600">{sale.remarks}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const LPOCard = ({ lpo }: { lpo: LPO }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">LPO Number</p>
            <p className="text-lg">{lpo.lpo_no}</p>
          </div>
          <div>
            <p className="text-sm font-medium">LPO Date</p>
            <p className="text-lg">{new Date(lpo.lpo_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Client</p>
            <p className="text-lg">{lpo.sale.client.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Project</p>
            <p className="text-lg">{lpo.sale.project.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Quantity</p>
            <p className="text-lg">{lpo.sale.quantity.toLocaleString()} Gallons</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Amount</p>
            <p className="text-lg">AED {lpo.sale.total_amount.toLocaleString()}</p>
          </div>
        </div>
        {lpo.remarks && (
          <div className="mt-4">
            <p className="text-sm font-medium">Remarks</p>
            <p className="text-gray-600">{lpo.remarks}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">LPO Management</h1>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending LPO ({pendingLPOs.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active LPO ({activeLPOs.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedLPOs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pending LPO</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLPOs.map((sale) => (
                <div key={sale.id} className="mb-4">
                  <SaleCard sale={sale} />
                  <div className="flex justify-end mt-2">
                    <Button onClick={() => router.push(`/sales/${sale.id}/lpo`)}>
                      Add LPO
                    </Button>
                  </div>
                </div>
              ))}
              {pendingLPOs.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No sales pending LPO
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active LPOs</CardTitle>
            </CardHeader>
            <CardContent>
              {activeLPOs.map((lpo) => (
                <div key={lpo.id} className="mb-4">
                  <LPOCard lpo={lpo} />
                  <div className="flex justify-end mt-2">
                    <Button onClick={() => router.push(`/sales/lpo/${lpo.id}/invoice`)}>
                      Generate Invoice
                    </Button>
                  </div>
                </div>
              ))}
              {activeLPOs.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No active LPOs
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed LPOs</CardTitle>
            </CardHeader>
            <CardContent>
              {completedLPOs.map((lpo) => (
                <div key={lpo.id} className="mb-4">
                  <LPOCard lpo={lpo} />
                  {lpo.invoice && (
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Invoice Number</p>
                          <p className="text-lg">{lpo.invoice.invoice_no}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Invoice Date</p>
                          <p className="text-lg">{new Date(lpo.invoice.invoice_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-lg">{lpo.invoice.status}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {completedLPOs.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No completed LPOs
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 