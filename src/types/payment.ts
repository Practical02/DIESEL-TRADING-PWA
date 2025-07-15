export type PaymentEntry = {
  id: string;
  client: string;
  project: string;
  sale_id: string;
  invoice_no: string;
  payment_date: string;
  payment_method: string; 
  reference_no?: string;
  amount: number;
  remarks?: string;
};
