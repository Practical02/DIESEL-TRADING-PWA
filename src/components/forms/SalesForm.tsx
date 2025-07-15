"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "../ui/textarea";
import { SaleFormData, Client } from "@/types/sale";

type SalesFormProps = {
  initialData?: SaleFormData;
  onSubmit?: () => void;
};

export default function SalesForm({ initialData, onSubmit }: SalesFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [form, setForm] = useState({
    clientId: initialData?.clientId || "",
    projectId: initialData?.projectId || "",
    quantity: initialData?.quantity?.toString() || "",
    purchase_cost: initialData?.purchase_cost?.toString() || "",
    unit_price: initialData?.unit_price?.toString() || "",
    total_amount: initialData?.total_amount || 0,
    total_profit: 0,
    remarks: initialData?.remarks || "",
    sale_date: initialData?.sale_date || new Date().toISOString().split('T')[0],
  });

  const [availableStock, setAvailableStock] = useState(0);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchAvailableStock();
  }, []);

  useEffect(() => {
    // Update total amount and profit when quantity or prices change
    const quantity = parseFloat(form.quantity) || 0;
    const unitPrice = parseFloat(form.unit_price) || 0;
    const purchaseCost = parseFloat(form.purchase_cost) || 0;
    
    const subtotal = quantity * unitPrice;
    const totalCost = quantity * purchaseCost;
    const profit = subtotal - totalCost;
    
    setForm(prev => ({ 
      ...prev, 
      total_amount: subtotal,
      total_profit: profit
    }));
  }, [form.quantity, form.unit_price, form.purchase_cost]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);

      // If editing, set the selected client
      if (initialData?.clientId) {
        const client = data.find((c: Client) => c.id === initialData.clientId);
        setSelectedClient(client || null);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchAvailableStock = async () => {
    setStockLoading(true);
    try {
      const response = await fetch('/api/stock');
      if (!response.ok) throw new Error('Failed to fetch stock');
      const data = await response.json();
      const totalStock = data.reduce((sum: number, stock: { quantity: number }) => sum + stock.quantity, 0);
      setAvailableStock(totalStock);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setStockLoading(false);
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setForm(prev => ({ ...prev, clientId, projectId: "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate stock availability
    const requestedQuantity = parseFloat(form.quantity);
    if (requestedQuantity > availableStock) {
      alert(`Insufficient stock! Available: ${availableStock.toLocaleString()} gallons, Requested: ${requestedQuantity.toLocaleString()} gallons`);
      return;
    }
    
    setIsLoading(true);

    try {
      const url = initialData?.id ? '/api/sales' : '/api/sales';
      const method = initialData?.id ? 'PUT' : 'POST';
      
      // Convert string values to numbers for the API
      const body = {
        ...form,
        quantity: parseFloat(form.quantity),
        purchase_cost: parseFloat(form.purchase_cost),
        unit_price: parseFloat(form.unit_price),
        status: 'PENDING_LPO',
        ...(initialData?.id && { id: initialData.id }),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save sale');
      }

      if (onSubmit) {
        onSubmit();
      } else {
        router.push('/sales');
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.error('Error saving sale:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Edit Sale' : 'New Sale Entry'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="clientId" className="text-sm font-medium">Client</label>
            <select
              id="clientId"
              name="clientId"
              value={form.clientId}
              onChange={handleClientChange}
              className="w-full border p-2 rounded"
              required
              disabled={!!initialData?.id}
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="projectId" className="text-sm font-medium">Project</label>
            <select
              id="projectId"
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              disabled={!selectedClient || !!initialData?.id}
            >
              <option value="">Select Project</option>
              {selectedClient?.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity (Gallons)
                <span className="ml-2 text-sm text-gray-500">
                  {stockLoading ? 'Loading...' : `Available: ${availableStock.toLocaleString()}`}
                </span>
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={handleChange}
                required
                placeholder="Enter quantity"
                max={availableStock}
              />
              {parseFloat(form.quantity) > availableStock && (
                <p className="text-sm text-red-600">
                  ⚠️ Insufficient stock! Available: {availableStock.toLocaleString()} gallons
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="sale_date" className="text-sm font-medium">Sale Date</label>
              <Input
                id="sale_date"
                name="sale_date"
                type="date"
                value={form.sale_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="purchase_cost" className="text-sm font-medium">Purchase Cost (AED/Gal)</label>
              <Input
                id="purchase_cost"
                name="purchase_cost"
                type="number"
                step="0.01"
                value={form.purchase_cost}
                onChange={handleChange}
                required
                placeholder="Enter purchase cost"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="unit_price" className="text-sm font-medium">Sales Rate (AED/Gal)</label>
              <Input
                id="unit_price"
                name="unit_price"
                type="number"
                step="0.01"
                value={form.unit_price}
                onChange={handleChange}
                required
                placeholder="Enter sales rate"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Amount</label>
              <div className="flex items-center space-x-2 h-10 px-3 border rounded bg-gray-100">
                <span>AED {form.total_amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Profit</label>
              <div className="flex items-center space-x-2 h-10 px-3 border rounded bg-gray-100">
                <span>AED {form.total_profit.toLocaleString()}</span>
                {form.total_profit > 0 && form.total_amount > 0 && (
                  <span className="text-green-600">
                    ({((form.total_profit / form.total_amount) * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="remarks" className="text-sm font-medium">Remarks</label>
            <Textarea
              id="remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData?.id ? 'Update Sale' : 'Create Sale'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
