
export enum UserRole {
  ADMIN = 'ADMIN',
  ARTISAN = 'ARTISAN',
  CLIENT = 'CLIENT'
}

export enum OrderStatus {
  IN_CART = 'IN_CART',
  PENDING = 'PENDING',
  IN_FABRICATION = 'IN_FABRICATION',
  FINISHED = 'FINISHED',
  DELIVERED = 'DELIVERED',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  region?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  artisanProfile?: {
    bio?: string;
    specialties?: string[];
    experience?: number;
    region?: string;
  };
  isApproved?: boolean;
  craftType?: string;
}

export interface Product {
  id: string;
  artisanId: string;
  artisanName: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  isCustomizable: boolean;
  stock: number;
  material?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  customizationDetails?: string;
}

export interface Order {
  id?: string;
  _id?: string;
  clientId?: string;
  artisanId?: string;
  productId?: string;
  productTitle?: string;
  status: OrderStatus;
  date?: string;
  createdAt: string;
  total?: number;
  totalAmount: number;
  isCustom?: boolean;
  notes?: string;
  items?: any[];
  shippingAddress?: string;
  artisan?: { name: string };
  client?: { name: string };
}

export interface CustomRequest {
  productId: string;
  dimensions?: string;
  materialDetails?: string;
  notes: string;
  deadline?: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface Notification {
  _id: string;
  message: string;
  type: 'ORDER_STATUS' | 'PAYMENT' | 'SYSTEM' | 'MESSAGE';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}