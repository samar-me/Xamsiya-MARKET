import fs from 'fs';
import path from 'path';

export interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedModel?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  comment?: string;
  items: CartItem[];
  totalPrice: number;
  discountApplied?: number;
  status: 'Yangi' | 'Yetkazilmoqda' | 'Bajarildi' | 'Bekor qilindi';
  createdAt: string;
  updatedAt?: string;
  telegramMessageId?: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Papka va faylni ta'minlash
function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    ensureFileExists();
    const data = await fs.promises.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('getOrders error:', err);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function saveOrder(order: Order): Promise<Order> {
  ensureFileExists();
  const orders = await getOrders();
  const existingIndex = orders.findIndex((o) => o.id === order.id);

  if (existingIndex >= 0) {
    orders[existingIndex] = { ...orders[existingIndex], ...order, updatedAt: new Date().toISOString() };
  } else {
    orders.unshift(order);
  }

  await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  telegramMessageId?: number
): Promise<Order | null> {
  ensureFileExists();
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id.toLowerCase() === id.toLowerCase());

  if (index === -1) return null;

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  if (telegramMessageId) {
    orders[index].telegramMessageId = telegramMessageId;
  }

  await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return orders[index];
}
