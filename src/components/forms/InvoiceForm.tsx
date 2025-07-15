"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

type InvoiceFormData = {
  id?: string;
  lpoId: string;
  invoice_no: string;
  invoice_date: string;
  remarks?: string;
};

type InvoiceFormProps = {
  initialData?: InvoiceFormData;
  lpoId: string;
  onSubmit?: () => void;
};

export default function InvoiceForm({ initialData, lpoId, onSubmit }: InvoiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceFormData>({
    lpoId,
    invoice_no: initialData?.invoice_no || "",
    invoice_date: initialData?.invoice_date || new Date().toISOString().split('T')[0],
    remarks: initialData?.remarks || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(null); // Clear error when form changes
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting invoice form:', form);

      // Validate required fields
      if (!form.invoice_no.trim()) {
        throw new Error('Invoice number is required');
      }

      if (!form.invoice_date) {
        throw new Error('Invoice date is required');
      }

      if (!form.lpoId) {
        throw new Error('LPO ID is missing');
      }

      const response = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save invoice');
      }

      if (onSubmit) {
        onSubmit();
      } else {
        router.push('/sales');
        router.refresh();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      if (error instanceof Error) {
        setError(error.message);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      } else {
        setError('An unexpected error occurred');
        console.error('Unknown error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Invoice Details</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="invoice_no" className="text-sm font-medium">Invoice Number</label>
              <Input
                id="invoice_no"
                name="invoice_no"
                value={form.invoice_no}
                onChange={handleChange}
                required
                placeholder="Enter invoice number"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="invoice_date" className="text-sm font-medium">Invoice Date</label>
              <Input
                id="invoice_date"
                name="invoice_date"
                type="date"
                value={form.invoice_date}
                onChange={handleChange}
                required
              />
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
              {isLoading ? 'Saving...' : 'Add Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 