"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "../ui/textarea";

type StockFormData = {
  id?: string;
  supplier: string;
  quantity: number;
  purchase_cost: number;
  purchase_date: string;
  remarks?: string;
};

type StockFormProps = {
  initialData?: StockFormData;
  onSubmit?: () => void;
};

export default function StockForm({ initialData, onSubmit }: StockFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<StockFormData>({
    id: initialData?.id,
    supplier: initialData?.supplier ?? "",
    quantity: initialData?.quantity ?? 0,
    purchase_cost: initialData?.purchase_cost ?? 0,
    purchase_date: initialData?.purchase_date ?? new Date().toISOString().split('T')[0],
    remarks: initialData?.remarks ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = initialData?.id ? `/api/stock/${initialData.id}` : '/api/stock';
      const method = initialData?.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: parseFloat(form.quantity.toString()),
          purchase_cost: parseFloat(form.purchase_cost.toString()),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save stock entry');
      }

      if (onSubmit) {
        onSubmit();
      } else {
        router.push('/stock');
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.error('Error saving stock entry:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Edit Stock Entry' : 'Add Stock Entry'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="supplier" className="text-sm font-medium">Supplier</label>
            <Input
              id="supplier"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              required
              placeholder="Enter supplier name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">Quantity (Gallons)</label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={handleChange}
                required
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="purchase_cost" className="text-sm font-medium">Cost per Gallon (AED)</label>
              <Input
                id="purchase_cost"
                name="purchase_cost"
                type="number"
                step="0.01"
                value={form.purchase_cost}
                onChange={handleChange}
                required
                placeholder="Enter cost per gallon"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="purchase_date" className="text-sm font-medium">Purchase Date</label>
            <Input
              id="purchase_date"
              name="purchase_date"
              type="date"
              value={form.purchase_date}
              onChange={handleChange}
              required
            />
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
              {isLoading ? 'Saving...' : initialData?.id ? 'Update Stock' : 'Add Stock'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 