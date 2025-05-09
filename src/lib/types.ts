export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name as string
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO string format: "YYYY-MM-DD"
  categoryId: string | null;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  // period: 'monthly' | 'yearly'; // Future: for different budget periods
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string; // Optional fill color for charts
}
