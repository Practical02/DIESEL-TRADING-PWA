"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StockForm from "@/components/forms/StockForm";
import StockTable from "@/components/tables/StockTable";

type StockEntry = {
  id: string;
  supplier: string;
  quantity: number;
  purchase_cost: number;
  purchase_date: string;
  remarks?: string;
};

export default function StockPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<StockEntry | undefined>(undefined);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stockSummary, setStockSummary] = useState({
    totalQuantity: 0,
    totalValue: 0,
    averageCost: 0,
  });

  useEffect(() => {
    fetchStockEntries();
  }, []);

  const fetchStockEntries = async () => {
    try {
      const response = await fetch('/api/stock');
      if (!response.ok) throw new Error('Failed to fetch stock entries');
      const data = await response.json();
      setStockEntries(data);

      // Calculate summary
      const totalQuantity = data.reduce((sum: number, entry: StockEntry) => sum + entry.quantity, 0);
      const totalValue = data.reduce((sum: number, entry: StockEntry) => sum + (entry.quantity * entry.purchase_cost), 0);
      const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

      setStockSummary({
        totalQuantity,
        totalValue,
        averageCost,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching stock entries:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/stock?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete stock entry');
      }
      
      fetchStockEntries();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.error('Error deleting stock entry:', error.message);
      }
    }
  };

  const handleEdit = (entry: StockEntry) => {
    setSelectedEntry(entry);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedEntry(undefined);
    fetchStockEntries();
  };

  if (showForm) {
    return <StockForm initialData={selectedEntry} onSubmit={handleFormSubmit} />;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <Button onClick={() => setShowForm(true)}>Add Stock Entry</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stockSummary.totalQuantity.toLocaleString()} Gallons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">AED {stockSummary.totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">AED {stockSummary.averageCost.toFixed(2)}/Gal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <StockTable
            entries={stockEntries}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
} 