
export enum UserRole {
  ADMIN = 'ADMIN',
  ARTISAN = 'ARTISAN',
  CLIENT = 'CLIENT'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  MANUFACTURING = 'MANUFACTURING',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  region?: string;
  craftType?: string;
  bio?: string;
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
  isCustomizable: boolean;
  stock: number;
}

export interface Order {
  id: string;
  clientId: string;
  artisanId: string;
  productId: string;
  productTitle: string;
  status: OrderStatus;
  date: string;
  total: number;
  isCustom: boolean;
  notes?: string;
}

export interface CustomRequest {
  productId: string;
  dimensions?: string;
  materialDetails?: string;
  notes: string;
  deadline?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}