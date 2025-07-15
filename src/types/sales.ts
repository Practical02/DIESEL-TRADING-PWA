export type SaleEntry = {
  id: string;
  client: string;
  project: string;
  stock_id: string;
  stock_supplier: string;
  quantity: number;
  stock_price_per_litre: number;
  sale_price_per_litre: number;
  vat: number;
  total_amount: number;
  profit_per_litre: number;
  total_profit: number;
  is_paid: boolean;
  sale_date: string;

  lpo_no?: string;
  lpo_date?: string;

  invoice_no?: string;
  invoice_date?: string;
};
