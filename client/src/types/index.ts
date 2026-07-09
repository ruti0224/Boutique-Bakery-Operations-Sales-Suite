export interface Category {
  categoryCode: number;
  name: string;
}

export interface Cake {
  id: number;
  name: string;
  description: string;
  price: number;
  ingredients: string;
  imageUrl: string;
  recommendation?: string[];
  isActive: boolean;
  category?: Category | null;
}

export interface User {
  code: number;
  name: string;
  email: string;
  phoneNumber: string;
  role?: string;
  cakesInCart?: OrderItem[];
  userOrders?: Order[];
}

export interface OrderItem {
  code: number;
  quantity: number;
  cake: Cake;
}

// הסטטוס PENDING הוסף לכאן
export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "READY_FOR_PICKUP" | "DELIVERED" | "CANCELLED";

export interface Order {
  orderCode: number;
  user?: User;
  orderDate: string;
  deliveryDate: string;
  totalPrice: number;
  status: OrderStatus;
  notes?: string;
  cakes?: OrderItem[];
}

export type PaymentStatus = "SUCCESS" | "FAILED" | "REFUNDED";

export interface Payment {
  id: number;
  order?: Order;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId: string;
}