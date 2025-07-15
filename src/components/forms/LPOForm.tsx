"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "../ui/textarea";

type LPOFormData = {
  id?: string;
  saleId: string;
  lpo_no: string;
  lpo_date: string;
  remarks?: string;
};

type LPOFormProps = {
  initialData?: LPOFormData;
  saleId: string;
  onSubmit?: () => void;
};

export default function LPOForm({ initialData, saleId, onSubmit }: LPOFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<LPOFormData>({
    saleId,
    lpo_no: initialData?.lpo_no || "",
    lpo_date: initialData?.lpo_date || new Date().toISOString().split('T')[0],
    remarks: initialData?.remarks || "",
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
      const response = await fetch('/api/lpo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save LPO');
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
        console.error('Error saving LPO:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add LPO Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="lpo_no" className="text-sm font-medium">LPO Number</label>
              <Input
                id="lpo_no"
                name="lpo_no"
                value={form.lpo_no}
                onChange={handleChange}
                required
                placeholder="Enter LPO number"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="lpo_date" className="text-sm font-medium">LPO Date</label>
              <Input
                id="lpo_date"
                name="lpo_date"
                type="date"
                value={form.lpo_date}
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
              {isLoading ? 'Saving...' : 'Add LPO'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 