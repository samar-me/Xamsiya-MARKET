import fs from 'fs';
import path from 'path';
import os from 'os';

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

// Serverless (Vercel) va mahalliy muhit uchun xavfsiz fayl yo'li
function getOrdersFilePath(): string {
  // Vercel serverless muhitida faqat /tmp papkasiga yozish mumkin
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'xamsiya_orders.json');
  }
  return path.join(process.cwd(), 'data', 'orders.json');
}

// Serverless jarayonida hot-cache uchun in-memory xotira
let inMemoryOrders: Order[] = [];

// Fayl va papkani xavfsiz yaratish
function ensureFileExists(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    // Diskka yozish imkoni bo'lmasa xatolik chiqarmaymiz
    console.warn('ensureFileExists filesystem warning (using memory fallback):', err);
  }
}

export async function getOrders(): Promise<Order[]> {
  const filePath = getOrdersFilePath();
  try {
    ensureFileExists(filePath);
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      const parsed: Order[] = JSON.parse(data || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Diskdagi buyurtmalar bilan memoryni sinxronlashtirish
        const map = new Map<string, Order>();
        inMemoryOrders.forEach((o) => map.set(o.id.toLowerCase(), o));
        parsed.forEach((o) => map.set(o.id.toLowerCase(), o));
        inMemoryOrders = Array.from(map.values());
        return inMemoryOrders;
      }
    }
    return inMemoryOrders;
  } catch (err) {
    console.warn('getOrders filesystem read warning:', err);
    return inMemoryOrders;
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function saveOrder(order: Order): Promise<Order> {
  const filePath = getOrdersFilePath();
  const orders = await getOrders();
  const existingIndex = orders.findIndex((o) => o.id.toLowerCase() === order.id.toLowerCase());

  if (existingIndex >= 0) {
    orders[existingIndex] = { ...orders[existingIndex], ...order, updatedAt: new Date().toISOString() };
  } else {
    orders.unshift(order);
  }

  inMemoryOrders = orders;

  try {
    ensureFileExists(filePath);
    await fs.promises.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.warn('saveOrder filesystem write warning (saved to in-memory):', err);
  }

  return order;
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  telegramMessageId?: number
): Promise<Order | null> {
  const filePath = getOrdersFilePath();
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id.toLowerCase() === id.toLowerCase());

  if (index === -1) return null;

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  if (telegramMessageId) {
    orders[index].telegramMessageId = telegramMessageId;
  }

  inMemoryOrders = orders;

  try {
    ensureFileExists(filePath);
    await fs.promises.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.warn('updateOrderStatus filesystem write warning:', err);
  }

  return orders[index];
}
