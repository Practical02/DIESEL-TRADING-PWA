"use client";

import PendingPaymentsReport from "@/components/reports/PendingPaymentsReport";

export default function PendingPaymentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Payments Report</h1>
      <PendingPaymentsReport />
    </div>
  );
}
