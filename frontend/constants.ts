
import { Product, User, UserRole, OrderStatus, Order } from './types';
export const CRAFT_CATEGORIES = [
  'Tissage (زرابي)',
  'Poterie et Céramique (خزف وفخار)',
  'Dinanderie (نحاس)',
  'Menuiserie Traditionnelle (نجارة تقليدية)',
  'Broderie Artisanale (طرز تقليدي)',
  'Couture (Kaftan & Djellaba) (خياطة تقليدية)',
  'Maroquinerie (صناعة الجلود)',
  'Zellige (زليج)',
  'Ferronnerie (حدادة فنية)',
  'Tannage (دباغة)'
];

export const REGIONS = [
  'Fès-Meknès',
  'Marrakech-Safi',
  'Tanger-Tétouan-Al Hoceïma',
  'Casablanca-Settat',
  'Rabat-Salé-Kénitra',
  'Souss-Massa'
];

export const MOCK_USERS: User[] = [
  {
    id: 'u_admin',
    name: 'Admin Centrale',
    email: 'admin@artisanat.ma',
    role: UserRole.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200'
  },
  {
    id: 'a1',
    name: 'Ahmed El Fassi',
    email: 'ahmed@fassi.ma',
    role: UserRole.ARTISAN,
    region: 'Fès-Meknès',
    artisanProfile: {
      bio: 'Maître artisan tisserand depuis plus de 30 ans. Mon atelier à Fès perpétue la tradition du tissage Beni Ouarain avec de la laine pure de l\'Atlas.',
      specialties: ['Tissage (زرابي)'],
      region: 'Fès-Meknès'
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200'
  },
  {
    id: 'a2',
    name: 'Fatima Zahra',
    email: 'fatima@ceramique.ma',
    role: UserRole.ARTISAN,
    region: 'Marrakech-Safi',
    artisanProfile: {
      bio: 'Passionnée par les arts du feu, je crée des pièces uniques inspirées des motifs ancestraux de Safi, tout en apportant une touche de modernité.',
      specialties: ['Poterie et Céramique'],
      region: 'Marrakech-Safi'
    },
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200'
  },
  {
    id: 'c1',
    name: 'Youssef Mansouri',
    email: 'youssef@client.ma',
    role: UserRole.CLIENT,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    artisanId: 'a1',
    artisanName: 'Ahmed El Fassi',
    title: 'Tapis Beni Ouarain Authentique',
    description: 'Tapis en laine naturelle fait main par des tisseuses de l\'Atlas. Motifs géométriques traditionnels noirs sur fond crème.',
    price: 4500,
    category: 'Tissage (زرابي)',
    image: 'https://images.unsplash.com/photo-1610366398327-1422b4065664?auto=format&fit=crop&w=800&q=80',
    isCustomizable: true,
    stock: 2
  },
  {
    id: 'p2',
    artisanId: 'a2',
    artisanName: 'Fatima Zahra',
    title: 'Vase en Céramique de Safi',
    description: 'Vase peint à la main avec des pigments naturels, émaillage traditionnel bleu de Safi.',
    price: 350,
    category: 'Poterie et Céramique',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    isCustomizable: false,
    stock: 15
  },
  {
    id: 'p3',
    artisanId: 'a1',
    artisanName: 'Ahmed El Fassi',
    title: 'Kilim Berbère de l\'Atlas',
    description: 'Tissage plat traditionnel avec des couleurs végétales vibrantes représentant l\'histoire de la tribu.',
    price: 2200,
    category: 'Tissage (زرابي)',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    isCustomizable: true,
    stock: 3
  },
  {
    id: 'p4',
    artisanId: 'a2',
    artisanName: 'Fatima Zahra',
    title: 'Plat de Service à Motifs Zellige',
    description: 'Grande assiette décorative pouvant servir de plat de présentation. Peinte à la main avec précision.',
    price: 480,
    category: 'Poterie et Céramique',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    isCustomizable: true,
    stock: 8
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    clientId: 'c1',
    artisanId: 'a1',
    productId: 'p1',
    productTitle: 'Tapis Beni Ouarain Authentique',
    status: OrderStatus.IN_FABRICATION,
    date: '2023-11-20',
    createdAt: new Date().toISOString(),
    total: 4500,
    totalAmount: 4500,
    isCustom: true,
    notes: 'Dimensions spéciales: 2x3 mètres'
  }
];