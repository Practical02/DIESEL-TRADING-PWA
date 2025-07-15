"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import ClientForm from "@/components/forms/ClientForm";

type Project = {
  id: string;
  name: string;
};

type Invoice = {
  id: string;
  invoice_no: string;
  invoice_date: string;
  status: string;
};

type LPO = {
  id: string;
  lpo_no: string;
  lpo_date: string;
  status: string;
  invoice: Invoice | null;
};

type Sale = {
  id: string;
  quantity: number;
  unit_price: number;
  purchase_cost: number;
  total_amount: number;
  status: string;
  sale_date: string;
  lpo: LPO | null;
};

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  projects: Project[];
  sales: Sale[];
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const response = await fetch(`/api/clients?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete client');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedClient(null);
    fetchClients();
  };

  const getTotalSales = (client: Client) => {
    return client.sales.reduce((total, sale) => total + sale.total_amount, 0);
  };

  const getPendingLPOs = (client: Client) => {
    return client.sales.filter(sale => sale.status === 'PENDING_LPO').length;
  };

  const getPendingInvoices = (client: Client) => {
    return client.sales.filter(sale => 
      sale.lpo && sale.lpo.status === 'INVOICE_PENDING'
    ).length;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (showForm) {
    return <ClientForm initialData={selectedClient || undefined} onSubmit={handleFormSubmit} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button onClick={() => setShowForm(true)}>Add New Client</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{client.name}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(client.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.phone && (
                  <p className="text-sm">Phone: {client.phone}</p>
                )}
                {client.email && (
                  <p className="text-sm">Email: {client.email}</p>
                )}
                {client.address && (
                  <p className="text-sm">Address: {client.address}</p>
                )}
                <div className="pt-4 border-t mt-4">
                  <p className="text-sm">
                    <strong>Projects:</strong> {client.projects.length}
                  </p>
                  <p className="text-sm">
                    <strong>Total Sales:</strong> AED {getTotalSales(client).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Pending LPOs:</strong> {getPendingLPOs(client)}
                  </p>
                  <p className="text-sm">
                    <strong>Pending Invoices:</strong> {getPendingInvoices(client)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
