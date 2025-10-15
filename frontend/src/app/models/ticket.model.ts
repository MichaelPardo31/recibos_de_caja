import { SaleItem } from "./sale-item.model";

export interface Ticket {
  id: string;
  createdAt: string; // ISO date string
  items: SaleItem[];
  total: number;
}


