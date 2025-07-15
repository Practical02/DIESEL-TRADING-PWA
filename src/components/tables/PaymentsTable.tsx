"use client";

import { PaymentEntry } from "@/types/payment";

type Props = {
  data: PaymentEntry[];
};

export default function PaymentsTable({ data }: Props) {
  return (
    <table className="w-full text-sm border-collapse border">
      <thead className="bg-gray-100">
        <tr>
          <th className="border p-2">Date</th>
          <th className="border p-2">Client</th>
          <th className="border p-2">Project</th>
          <th className="border p-2">Method</th>
          <th className="border p-2">Ref No</th>
          <th className="border p-2">Amount</th>
          <th className="border p-2">Remarks</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p) => (
          <tr key={p.id}>
            <td className="border p-2">{p.payment_date}</td>
            <td className="border p-2">{p.client}</td>
            <td className="border p-2">{p.project}</td>
            <td className="border p-2">{p.payment_method}</td>
            <td className="border p-2">{p.reference_no}</td>
            <td className="border p-2 text-right">{p.amount.toFixed(2)}</td>
            <td className="border p-2">{p.remarks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
