"use client";

import { Button } from "@/components/ui/button";

type StockEntry = {
  id: string;
  supplier: string;
  quantity: number;
  purchase_cost: number;
  purchase_date: string;
  remarks?: string;
};

type StockTableProps = {
  entries: StockEntry[];
  onEdit: (entry: StockEntry) => void;
  onDelete: (id: string) => void;
};

export default function StockTable({ entries, onEdit, onDelete }: StockTableProps) {
  const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalValue = entries.reduce((sum, entry) => sum + (entry.quantity * entry.purchase_cost), 0);
  const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Supplier</th>
            <th className="text-right py-2">Quantity (Gal)</th>
            <th className="text-right py-2">Cost/Gal</th>
            <th className="text-right py-2">Total Cost</th>
            <th className="text-right py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b">
              <td className="py-2">{new Date(entry.purchase_date).toLocaleDateString()}</td>
              <td className="py-2">{entry.supplier}</td>
              <td className="text-right py-2">{entry.quantity.toLocaleString()}</td>
              <td className="text-right py-2">AED {entry.purchase_cost.toFixed(2)}</td>
              <td className="text-right py-2">
                AED {(entry.quantity * entry.purchase_cost).toLocaleString()}
              </td>
              <td className="text-right py-2">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(entry)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2">
          <tr>
            <td className="py-2 font-bold" colSpan={2}>Total</td>
            <td className="text-right py-2 font-bold">{totalQuantity.toLocaleString()}</td>
            <td className="text-right py-2 font-bold">
              AED {averageCost.toFixed(2)}
            </td>
            <td className="text-right py-2 font-bold">
              AED {totalValue.toLocaleString()}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
} 