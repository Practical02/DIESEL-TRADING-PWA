"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface PaymentFormProps {
  saleId: string;
  clientId: string;
  totalAmount: number;
  paidAmount: number;
  onSuccess?: () => void;
}

export default function PaymentForm({
  saleId,
  clientId,
  totalAmount,
  paidAmount,
  onSuccess,
}: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const remainingAmount = totalAmount - paidAmount;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      saleId,
      clientId,
      payment_date: formData.get('payment_date'),
      payment_method: formData.get('payment_method'),
      reference_no: formData.get('reference_no'),
      amount: parseFloat(formData.get('amount') as string),
      remarks: formData.get('remarks'),
    };

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment');
      }

      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Payment Date
          </label>
          <Input
            type="date"
            name="payment_date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Payment Method
          </label>
          <select
            name="payment_method"
            className="w-full border rounded-md p-2"
            required
          >
            <option value="">Select Method</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Reference Number
          </label>
          <Input
            type="text"
            name="reference_no"
            placeholder="Enter reference number"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Amount (Remaining: {remainingAmount.toFixed(2)})
          </label>
          <Input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            max={remainingAmount}
            required
            placeholder="Enter payment amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Remarks
          </label>
          <Input
            type="text"
            name="remarks"
            placeholder="Enter remarks (optional)"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Submit Payment'}
        </Button>
      </form>
    </Card>
  );
}
