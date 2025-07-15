"use client";

import { useParams } from "next/navigation";
import LPOForm from "@/components/forms/LPOForm";

export default function AddLPOPage() {
  const params = useParams();
  const saleId = params.id as string;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Add LPO</h1>
      <LPOForm saleId={saleId} />
    </div>
  );
} 