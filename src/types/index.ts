export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  currency?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  description?: string;
}