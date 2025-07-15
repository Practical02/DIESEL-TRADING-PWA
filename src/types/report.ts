export type VatReportEntry = {
  sale_date: string;
  client: string;
  project: string;
  total_amount: number;
  vat_percentage: number;
  vat_amount: number;
};

export type PendingLpoEntry = {
  sale_date: string;
  client: string;
  project: string;
  quantity: number;
  sale_price_per_litre: number;
};
