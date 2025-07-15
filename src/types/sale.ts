export type Client = {
  id: string;
  name: string;
  projects: {
    id: string;
    name: string;
  }[];
};

export type Project = {
  id: string;
  name: string;
};

export type Payment = {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_no: string | null;
};

export type Sale = {
  id: string;
  client: Client;
  project: Project;
  quantity: number;
  unit_price: number;
  total_amount: number;
  total_profit: number;
  status: string;
  sale_date: string;
  lpo_no: string | null;
  lpo_date: string | null;
  invoice_no: string | null;
  invoice_date: string | null;
  remarks: string | null;
  payments: Payment[];
  paid_amount: number;
  remaining_amount: number;
};

export type SaleFormData = {
  id?: string;
  clientId: string;
  projectId: string;
  quantity: number;
  purchase_cost: number;
  unit_price: number;
  total_amount: number;
  status: string;
  remarks?: string;
  sale_date: string;
}; 