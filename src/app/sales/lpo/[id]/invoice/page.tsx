"use client";

import { useParams } from "next/navigation";
import InvoiceForm from "@/components/forms/InvoiceForm";

export default function AddInvoicePage() {
  const params = useParams();
  const lpoId = params.id as string;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Add Invoice</h1>
      <InvoiceForm lpoId={lpoId} />
    </div>
  );
} 