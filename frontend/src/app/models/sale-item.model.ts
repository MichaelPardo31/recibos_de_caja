import { Product } from "./product.model";

export interface SaleItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}


