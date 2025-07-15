"use client";

import { useState, useEffect } from "react";

type Sale = {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  sale_date: string;
  client: {
    name: string;
  };
  project: {
    name: string;
  };
};

type Stock = {
  id: string;
  supplier: string;
  quantity: number;
  purchase_cost: number;
  purchase_date: string;
};

type VatReportProps = {
  fromDate?: string;
  toDate?: string;
};

export default function VatReport({
  fromDate,
  toDate,
}: VatReportProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  const UAE_VAT_RATE = 5; // 5% VAT in UAE

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const fetchData = async () => {
    try {
      // Fetch sales data
      let salesUrl = '/api/sales';
      if (fromDate && toDate) {
        salesUrl += `?start=${fromDate}&end=${toDate}`;
      }
      const salesResponse = await fetch(salesUrl);
      const salesData = await salesResponse.json();
      setSales(salesData);

      // Fetch stock data
      let stockUrl = '/api/stock';
      if (fromDate && toDate) {
        stockUrl += `?start=${fromDate}&end=${toDate}`;
      }
      const stockResponse = await fetch(stockUrl);
      const stockData = await stockResponse.json();
      setStocks(stockData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isWithinRange = (date: string) => {
    const d = new Date(date);
    if (fromDate && new Date(fromDate) > d) return false;
    if (toDate && new Date(toDate) < d) return false;
    return true;
  };

  const filteredStocks = stocks.filter((s) => isWithinRange(s.purchase_date));
  const filteredSales = sales.filter((s) => isWithinRange(s.sale_date));

  const totalInputVat = filteredStocks.reduce((sum, s) => {
    const vatAmount = (s.quantity * s.purchase_cost * UAE_VAT_RATE) / 100;
    return sum + vatAmount;
  }, 0);

  const totalOutputVat = filteredSales.reduce((sum, s) => {
    const vatAmount = (s.total_amount * UAE_VAT_RATE) / 100;
    return sum + vatAmount;
  }, 0);

  const netVat = totalOutputVat - totalInputVat;

  if (loading) {
    return <div className="flex justify-center p-4">Loading VAT report...</div>;
  }

  return (
    <div className="border rounded p-4 space-y-6">
      <h2 className="text-xl font-bold">VAT Report Summary</h2>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-semibold">Total Input VAT (on purchases): </span>
          AED {totalInputVat.toFixed(2)}
        </p>
        <p>
          <span className="font-semibold">Total Output VAT (on sales): </span>
          AED {totalOutputVat.toFixed(2)}
        </p>
        <p>
          <span className="font-semibold">Net VAT Payable: </span>
          <span
            className={
              netVat >= 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"
            }
          >
            AED {netVat.toFixed(2)}
          </span>
        </p>
      </div>

      {/* Stock Purchases Table */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Stock Purchases VAT Details</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-1">Date</th>
              <th className="border p-1">Supplier</th>
              <th className="border p-1">Quantity (Gal)</th>
              <th className="border p-1">Price/Gal (AED)</th>
              <th className="border p-1">VAT %</th>
              <th className="border p-1">VAT (AED)</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((s) => {
              const vatAmount = (s.quantity * s.purchase_cost * UAE_VAT_RATE) / 100;
              return (
                <tr key={s.id}>
                  <td className="border p-1">{new Date(s.purchase_date).toLocaleDateString()}</td>
                  <td className="border p-1">{s.supplier}</td>
                  <td className="border p-1 text-right">{s.quantity.toLocaleString()}</td>
                  <td className="border p-1 text-right">{s.purchase_cost.toFixed(2)}</td>
                  <td className="border p-1 text-right">{UAE_VAT_RATE}%</td>
                  <td className="border p-1 text-right">{vatAmount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sales VAT Table */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Sales VAT Details</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-1">Date</th>
              <th className="border p-1">Client</th>
              <th className="border p-1">Project</th>
              <th className="border p-1">Quantity (Gal)</th>
              <th className="border p-1">Sale Price/Gal (AED)</th>
              <th className="border p-1">VAT %</th>
              <th className="border p-1">VAT (AED)</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((s) => {
              const vatAmount = (s.total_amount * UAE_VAT_RATE) / 100;
              return (
                <tr key={s.id}>
                  <td className="border p-1">{new Date(s.sale_date).toLocaleDateString()}</td>
                  <td className="border p-1">{s.client.name}</td>
                  <td className="border p-1">{s.project.name}</td>
                  <td className="border p-1 text-right">{s.quantity.toLocaleString()}</td>
                  <td className="border p-1 text-right">{s.unit_price.toFixed(2)}</td>
                  <td className="border p-1 text-right">{UAE_VAT_RATE}%</td>
                  <td className="border p-1 text-right">{vatAmount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
