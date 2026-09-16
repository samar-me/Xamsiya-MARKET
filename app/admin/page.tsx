'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Lock,
  Package,
  ShoppingBag,
  DollarSign,
  Trash2,
  Plus,
  Phone,
  MapPin,
  Clock,
  LogOut,
  Search,
  Eye,
  AlertCircle,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Send,
  Volume2,
  VolumeX,
  Edit3,
  X,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight,
  Key,
  Store,
  FileSpreadsheet
} from 'lucide-react';
import { PRODUCTS as DEFAULT_PRODUCTS, Product, CATEGORIES } from '../../lib/products';

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedModel?: string;
}

interface Order {
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

const DEFAULT_PIN = '7788';

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};

// Web Audio API orqali yoqimli qo'ng'iroq (chime) ovozi
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // 1-nota (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // 2-nota (B5 - 987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.15);
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn('Audio chime warning:', e);
  }
}

export default function AdminPage() {
  // Autentifikatsiya
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>(DEFAULT_PIN);

  // Asosiy tablar
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'add' | 'telegram' | 'settings'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Ovozli bildirishnoma sozlamasi
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const prevOrdersCountRef = useRef<number>(0);

  // Buyurtmalar filtri
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('Barchasi');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Tanlangan buyurtma modali
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mahsulotlar filtri va qidiruvi
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('Barchasi');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // Mahsulotni tahrirlash modali
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Yangi tovar formasi
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(CATEGORIES[1] || 'Chexol');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOldPrice, setNewProdOldPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStock, setNewProdStock] = useState('50');

  // Telegram test xabari formasi
  const [tgCustomMsg, setTgCustomMsg] = useState('');
  const [tgStatusMsg, setTgStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tgSending, setTgSending] = useState(false);

  // Sozlamalar: yangi PIN formasi
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Serverdan buyurtmalarni yuklash
  const fetchOrdersFromServer = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders((prev) => {
          // Agar yangi buyurtma kelgan bo'lsa, ovoz chiqarish
          if (prevOrdersCountRef.current > 0 && data.orders.length > prevOrdersCountRef.current && soundEnabled) {
            playOrderChime();
          }
          prevOrdersCountRef.current = data.orders.length;

          // Birlashtirish
          const map = new Map<string, Order>();
          prev.forEach((o) => map.set(o.id.toLowerCase(), o));
          data.orders.forEach((o: Order) => map.set(o.id.toLowerCase(), o));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('xamsiya_orders', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    } catch (err) {
      console.error('Admin fetch orders error:', err);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  };

  // LocalStorage va sessiyani yuklash
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('xamsiya_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }

    const savedPin = localStorage.getItem('xamsiya_admin_pin');
    if (savedPin) {
      setAdminPin(savedPin);
    }

    const savedSound = localStorage.getItem('xamsiya_admin_sound');
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }

    try {
      const savedOrders = localStorage.getItem('xamsiya_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        setOrders(parsed);
        prevOrdersCountRef.current = parsed.length;
      }

      const savedProducts = localStorage.getItem('xamsiya_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(DEFAULT_PRODUCTS);
        localStorage.setItem('xamsiya_products', JSON.stringify(DEFAULT_PRODUCTS));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Tizimga kirganda avtomatik jonli sinxronizatsiya (har 6 soniyada)
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrdersFromServer();
      const interval = setInterval(() => fetchOrdersFromServer(false), 6000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, soundEnabled]);

  // PIN tekshiruvi
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('xamsiya_admin_auth', 'true');
      setPinError(false);
      setPinInput('');
      playOrderChime();
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('xamsiya_admin_auth');
  };

  // Ovozni yoqish/o'chirish
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('xamsiya_admin_sound', String(next));
    if (next) playOrderChime();
  };

  // Buyurtma holatini yangilash
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
    setOrders(updated);
    try {
      localStorage.setItem('xamsiya_orders', JSON.stringify(updated));
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      });
    } catch (err) {
      console.error('Failed to update status on server:', err);
    }
  };

  // Buyurtmani o'chirish
  const deleteOrderHandler = async (orderId: string) => {
    if (!confirm(`#${orderId} raqamli buyurtmani haqiqatan ham o'chirmoqchimisiz?`)) return;
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    if (selectedOrder?.id === orderId) setSelectedOrder(null);
    try {
      localStorage.setItem('xamsiya_orders', JSON.stringify(updated));
      await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  // Yangi tovar qo'shish
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newProd: Product = {
      id: Date.now(),
      name: newProdName.trim(),
      category: newProdCategory,
      price: parseInt(newProdPrice.replace(/\D/g, ''), 10),
      oldPrice: newProdOldPrice ? parseInt(newProdOldPrice.replace(/\D/g, ''), 10) : undefined,
      image: newProdImage.trim() || 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      rating: 5.0,
      reviewsCount: 1,
      isNew: true,
      description: newProdDesc.trim() || 'Original sifatli telefon aksessuari.'
    };

    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem('xamsiya_products', JSON.stringify(updated));

    // Formani tozalash
    setNewProdName('');
    setNewProdPrice('');
    setNewProdOldPrice('');
    setNewProdImage('');
    setNewProdDesc('');
    setActiveTab('products');
    alert("Yangi mahsulot do'konga muvaffaqiyatli qo'shildi!");
  };

  // Mahsulotni tahrirlashni saqlash
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    setProducts(updated);
    localStorage.setItem('xamsiya_products', JSON.stringify(updated));
    setEditingProduct(null);
    alert("Mahsulot ma'lumotlari yangilandi!");
  };

  // Mahsulotni o'chirish
  const deleteProductHandler = (id: number) => {
    if (confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem('xamsiya_products', JSON.stringify(updated));
    }
  };

  // Telegram test yoki e'lon yuborish
  const handleSendTelegramMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tgCustomMsg.trim()) return;
    setTgSending(true);
    setTgStatusMsg(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: tgCustomMsg })
      });
      const data = await res.json();
      if (data.success) {
        setTgStatusMsg({ type: 'success', text: "Xabar Telegram botga muvaffaqiyatli yuborildi!" });
        setTgCustomMsg('');
      } else {
        setTgStatusMsg({ type: 'error', text: data.message || "Yuborishda xatolik yuz berdi" });
      }
    } catch (err: any) {
      setTgStatusMsg({ type: 'error', text: err.message || "Aloqa xatosi" });
    } finally {
      setTgSending(false);
    }
  };

  // PIN-kodni o'zgartirish
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);
    if (oldPin !== adminPin) {
      setPinChangeMsg({ type: 'error', text: "Hozirgi PIN-kod noto'g'ri kiritildi!" });
      return;
    }
    if (newPin.length < 4) {
      setPinChangeMsg({ type: 'error', text: "Yangi PIN-kod kamida 4 xonali bo'lishi kerak!" });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ type: 'error', text: "Yangi PIN-kodlar bir-biriga mos kelmadi!" });
      return;
    }
    setAdminPin(newPin);
    localStorage.setItem('xamsiya_admin_pin', newPin);
    setPinChangeMsg({ type: 'success', text: "PIN-kod muvaffaqiyatli o'zgartirildi!" });
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
  };

  // Kvitansiya (Chek / Nakladnaya) chop etish
  const handlePrintReceipt = (ord: Order) => {
    const printWindow = window.open('', '_blank', 'width=700,height=800');
    if (!printWindow) {
      alert("Chop etish oynasiga ruxsat bering (Pop-up blocker)");
      return;
    }

    const itemsHtml = ord.items
      .map(
        (item, idx) => `
        <tr>
          <td style="padding: 8px 4px; border-bottom: 1px solid #e5e5e5; font-size: 13px;">${idx + 1}. ${item.name} ${item.selectedModel ? `<b>(${item.selectedModel})</b>` : ''} ${item.selectedColor ? `[${item.selectedColor}]` : ''}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #e5e5e5; text-align: center; font-size: 13px;">${item.quantity} dona</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #e5e5e5; text-align: right; font-size: 13px;">${formatPrice(item.price)}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #e5e5e5; text-align: right; font-size: 13px; font-weight: bold;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Chek #${ord.id} - Xamsiya Market</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; margin: 30px; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .sub { font-size: 12px; color: #666; }
          .meta-table { width: 100%; margin-bottom: 20px; font-size: 13px; }
          .meta-table td { padding: 4px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th { border-bottom: 2px solid #000; padding: 8px 4px; text-align: left; font-size: 12px; text-transform: uppercase; }
          .total-box { border-top: 2px dashed #000; padding-top: 10px; margin-top: 20px; text-align: right; }
          .total-sum { font-size: 20px; font-weight: 900; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">XAMSIYA MARKET</div>
          <div class="sub">Yakkabog' tumani markazi | Tel: +998 (20) 019-18-09</div>
          <div style="margin-top: 8px; font-weight: bold; font-size: 14px;">RASMIY XARID KVITANSIYASI</div>
        </div>

        <table class="meta-table">
          <tr>
            <td style="width: 50%;"><b>Buyurtma ID:</b> #${ord.id}</td>
            <td style="text-align: right;"><b>Sana:</b> ${ord.createdAt}</td>
          </tr>
          <tr>
            <td><b>Mijoz:</b> ${ord.customerName}</td>
            <td style="text-align: right;"><b>Holat:</b> ${ord.status}</td>
          </tr>
          <tr>
            <td><b>Telefon:</b> +998 ${ord.customerPhone}</td>
            <td style="text-align: right;"><b>To'lov turi:</b> Naqd / Karta</td>
          </tr>
          <tr>
            <td colspan="2"><b>Manzil:</b> ${ord.customerAddress}</td>
          </tr>
          ${ord.comment ? `<tr><td colspan="2"><b>Izoh:</b> ${ord.comment}</td></tr>` : ''}
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th>Mahsulot nomi</th>
              <th style="text-align: center;">Soni</th>
              <th style="text-align: right;">Narxi</th>
              <th style="text-align: right;">Jami</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          ${ord.discountApplied ? `<div style="font-size: 13px; color: #e11d48; margin-bottom: 4px;">🎁 Chegirma: -${formatPrice(ord.discountApplied)}</div>` : ''}
          <div>Jami to'lov miqdori:</div>
          <div class="total-sum">${formatPrice(ord.totalPrice)}</div>
        </div>

        <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 13px;">
          <div>Yetkazib beruvchi: ________________</div>
          <div>Mijoz imzosi: ________________</div>
        </div>

        <div class="footer">
          Xaridingiz uchun tashakkur! Xamsiya Market - Smartfoningiz uchun sifatli tanlov.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Excel / CSV formatda eksport qilish
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("Eksport qilish uchun buyurtmalar yo'q!");
      return;
    }

    const headers = ['ID', 'Mijoz Ismi', 'Telefon', 'Manzil', 'Izoh', 'Tovarlar', 'Jami Narx', 'Status', 'Sana'];
    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"+998${o.customerPhone.replace(/\D/g, '')}"`,
      `"${o.customerAddress.replace(/"/g, '""')}"`,
      `"${(o.comment || '').replace(/"/g, '""')}"`,
      `"${o.items.map((i) => `${i.name} (${i.quantity}x)`).join('; ')}"`,
      o.totalPrice,
      `"${o.status}"`,
      `"${o.createdAt}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `xamsiya_buyurtmalar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI va Statistik hisob-kitoblar
  const totalIncome = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'Bekor qilindi')
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }, [orders]);

  const newOrdersCount = useMemo(() => orders.filter((o) => o.status === 'Yangi').length, [orders]);
  const deliveringOrdersCount = useMemo(() => orders.filter((o) => o.status === 'Yetkazilmoqda').length, [orders]);
  const completedOrdersCount = useMemo(() => orders.filter((o) => o.status === 'Bajarildi').length, [orders]);
  const cancelledOrdersCount = useMemo(() => orders.filter((o) => o.status === 'Bekor qilindi').length, [orders]);

  // 7 000 ta chexol partiyasi hisobi
  const casesSoldCount = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'Bekor qilindi')
      .reduce((sum, ord) => {
        const orderCases = ord.items
          .filter((it) => it.category.toLowerCase().includes('chexol') || it.name.toLowerCase().includes('chexol'))
          .reduce((iSum, it) => iSum + it.quantity, 0);
        return sum + orderCases;
      }, 0);
  }, [orders]);

  const totalCasesInventory = 7000;
  const remainingCases = Math.max(0, totalCasesInventory - casesSoldCount);

  // Filtrangan buyurtmalar
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = orderStatusFilter === 'Barchasi' || o.status === orderStatusFilter;
      const q = orderSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerAddress.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Filtrangan mahsulotlar
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = productCategoryFilter === 'Barchasi' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
      const q = productSearchQuery.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, productCategoryFilter, productSearchQuery]);

  // 1. PIN KOD BILAN KIRISH OYNASI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
        <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          {/* Orqa fon bezaklari */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 p-0.5 mx-auto mb-5 shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-white">
                <Lock className="w-7 h-7" />
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">
              Xamsiya Market <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">Admin Pro</span>
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Do‘konni boshqarish va buyurtmalarni ko‘rish uchun xavfsizlik PIN-kodini kiriting
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="PIN-kodni kiriting (Standart: 7788)"
                  autoFocus
                  className="w-full text-center tracking-widest text-xl font-mono py-3.5 px-4 rounded-2xl bg-neutral-950 border border-neutral-800 focus:border-rose-500 outline-none transition-all text-white placeholder:text-neutral-600 placeholder:tracking-normal placeholder:text-xs shadow-inner"
                />
                {pinError && (
                  <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs animate-shake">
                    <AlertCircle className="w-4 h-4" />
                    <span>PIN-kod noto‘g‘ri! Qayta urinib ko‘ring.</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-sm transition-all shadow-xl hover:shadow-white/10 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Boshqaruv paneliga kirish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Shifrlangan tizim
              </span>
              <span>Standart PIN: <b className="text-neutral-300 font-mono">7788</b></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ADMIN PANELNING ASOSIY INTERFEYSI
  return (
    <div className="min-h-screen bg-[#0F1015] text-neutral-100 font-sans flex flex-col antialiased selection:bg-rose-500 selection:text-white">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#15171E]/95 backdrop-blur-md border-b border-neutral-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brend va Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900 p-0.5 flex items-center justify-center shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Xamsiya Market" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  Xamsiya Market
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 tracking-wider">
                  Admin Pro
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Jonli sinxronizatsiya
                </span>
                <span className="hidden sm:inline text-neutral-600">|</span>
                <span className="hidden sm:inline">Bot: @xamsiyamarket_bot</span>
              </div>
            </div>
          </div>

          {/* O'ng tomon amallari */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ovozli signal tugmasi */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'bg-neutral-800/80 border-neutral-700 text-amber-300 hover:bg-neutral-800'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
              }`}
              title={soundEnabled ? "Ovozli signal yoqilgan (chime)" : "Ovozli signal o'chirilgan"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline text-[11px]">{soundEnabled ? "Ovoz: Faol" : "Ovoz: O'chirilgan"}</span>
            </button>

            {/* Qo'lda yangilash */}
            <button
              onClick={() => fetchOrdersFromServer(true)}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 transition-all flex items-center gap-1.5"
              title="Serverdan buyurtmalarni yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
              <span className="hidden sm:inline">Yangilash</span>
            </button>

            {/* Saytga o'tish */}
            <a
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Sayt</span>
            </a>

            {/* Chiqish */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      {/* ASOSIY QISM */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* YON BOSHQARUV MENYUSI (SIDEBAR) */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-3 shadow-lg sticky top-22">
            <div className="text-[10px] uppercase font-bold text-neutral-500 px-3 pt-2 pb-1.5 tracking-wider">
              Boshqaruv menyusi
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>Buyurtmalar</span>
                </div>
                {newOrdersCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-neutral-950 animate-pulse">
                    {newOrdersCount} yangi
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-500 font-mono">{orders.length}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'products'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tovarlar & Ombor</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">{products.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('add')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'add'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4" />
                  <span>Yangi tovar</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('telegram')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'telegram'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4" />
                  <span>Telegram Bot</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4" />
                  <span>Sozlamalar & PIN</span>
                </div>
              </button>
            </nav>

            {/* 7000 Chexol Ombor Nazorati mini-vidjeti */}
            <div className="mt-4 p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-400 font-medium flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-rose-400" /> 7 000 Chexol
                </span>
                <span className="font-bold text-rose-400 text-[11px]">
                  {Math.round((casesSoldCount / totalCasesInventory) * 100)}% sotildi
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (casesSoldCount / totalCasesInventory) * 100 || 2)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Sotildi: <b>{casesSoldCount} ta</b></span>
                <span>Qoldiq: <b className="text-emerald-400">{remainingCases} ta</b></span>
              </div>
            </div>
          </div>
        </aside>

        {/* ASOSIY MAZMUN (CONTENT AREA) */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: DASHBOARD (ANALITIKA VA UMUMIY KO'RSATKICHLAR) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 Ta Asosiy KPI Kartasi */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#15171E] p-4 sm:p-5 rounded-3xl border border-neutral-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Jami Savdo</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formatPrice(totalIncome)}
                  </div>
                  <span className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Qabul qilingan to‘lovlar
                  </span>
                </div>

                <div className="bg-[#15171E] p-4 sm:p-5 rounded-3xl border border-neutral-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Kutilayotgan</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {newOrdersCount} ta
                  </div>
                  <span className="text-[11px] text-amber-400/90 mt-1 block">
                    Yangi tushgan buyurtmalar
                  </span>
                </div>

                <div className="bg-[#15171E] p-4 sm:p-5 rounded-3xl border border-neutral-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Yetkazilmoqda</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {deliveringOrdersCount} ta
                  </div>
                  <span className="text-[11px] text-blue-400/90 mt-1 block">
                    Kuryer yoki yo‘lda
                  </span>
                </div>

                <div className="bg-[#15171E] p-4 sm:p-5 rounded-3xl border border-neutral-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Bajarildi</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {completedOrdersCount} ta
                  </div>
                  <span className="text-[11px] text-purple-400/90 mt-1 block">
                    Mijoz qabul qilgan
                  </span>
                </div>
              </div>

              {/* 7 000 Chexol Katta Banneri */}
              <div className="bg-gradient-to-r from-rose-950/40 via-[#15171E] to-neutral-900 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                      Maxsus Chexol Loyihasi
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-2">
                      7 000 ta Chexol Ombordagi Holati
                    </h3>
                    <p className="text-xs text-neutral-400 max-w-xl mt-1">
                      Do‘koningizdagi 7 000 ta chexollar partiyasi sotuvini doimiy kuzatib boring. Sayt orqali chexollar buyurtma qilinganda bu hisoblagich avtomatik kamayib boradi.
                    </p>
                  </div>

                  <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-2xl shrink-0 text-center min-w-[160px]">
                    <div className="text-[11px] text-neutral-400 uppercase font-bold">Ombor Qoldig‘i</div>
                    <div className="text-3xl font-black text-emerald-400 mt-1 font-mono">
                      {remainingCases}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">dona sotuvga tayyor</div>
                  </div>
                </div>
              </div>

              {/* So'nggi Yangi Buyurtmalar bloki */}
              <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Oxirgi tushgan buyurtmalar</span>
                      {newOrdersCount > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {newOrdersCount} yangi
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Tezkor ko‘rib chiqish va statusni boshqarish</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                  >
                    <span>Barchasini ko‘rish</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 text-xs">
                    <Package className="w-10 h-10 mx-auto mb-2 text-neutral-600" />
                    Hozircha buyurtmalar mavjud emas
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-rose-400">
                            #{ord.id.slice(-4)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{ord.customerName}</span>
                              <span className="text-xs text-neutral-400 font-mono">+998 {ord.customerPhone}</span>
                            </div>
                            <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                              {ord.items.map((i) => `${i.name} (${i.quantity}x)`).join(', ')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                          <div className="text-right">
                            <div className="font-black text-sm text-white">{formatPrice(ord.totalPrice)}</div>
                            <div className="text-[10px] text-neutral-500">{ord.createdAt}</div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                              ord.status === 'Yangi'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : ord.status === 'Yetkazilmoqda'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : ord.status === 'Bajarildi'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BUYURTMALAR (MUKAMMAL JADVAL VA AMALLAR) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Qidiruv, Filtr va Eksport paneli */}
              <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="ID, ism, telefon yoki manzil bo‘yicha qidiring..."
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Excel/CSV ga yuklash */}
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all shrink-0"
                      title="Barcha buyurtmalarni Excel CSV formatida yuklab olish"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Excel CSV</span>
                    </button>

                    <button
                      onClick={() => fetchOrdersFromServer(true)}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 border border-neutral-700 transition-all shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
                      <span className="hidden sm:inline">Yangilash</span>
                    </button>
                  </div>
                </div>

                {/* Status Filtr Tugmalari */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'Barchasi', label: 'Barchasi', count: orders.length },
                    { id: 'Yangi', label: '🟡 Yangi', count: newOrdersCount },
                    { id: 'Yetkazilmoqda', label: '🚚 Yetkazilmoqda', count: deliveringOrdersCount },
                    { id: 'Bajarildi', label: '🎉 Bajarildi', count: completedOrdersCount },
                    { id: 'Bekor qilindi', label: '❌ Bekor qilindi', count: cancelledOrdersCount }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOrderStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                        orderStatusFilter === tab.id
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="px-1.5 py-0.2 rounded-md bg-black/30 text-[10px] font-mono">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Buyurtmalar ro'yxati */}
              {filteredOrders.length === 0 ? (
                <div className="bg-[#15171E] rounded-3xl p-12 text-center border border-neutral-800">
                  <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <h3 className="font-bold text-neutral-300">Hech qanday buyurtma topilmadi</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Qidiruv so‘zini o‘zgartiring yoki sayt orqali yangi buyurtma kelishini kuting.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-[#15171E] rounded-3xl p-4 sm:p-5 border border-neutral-800/90 hover:border-neutral-700 transition-all shadow-sm space-y-3"
                    >
                      {/* Buyurtma sarlavhasi */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl">
                            #{ord.id}
                          </span>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-500" /> {ord.createdAt}
                          </span>
                          {ord.comment && (
                            <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg line-clamp-1 max-w-xs">
                              💬 {ord.comment}
                            </span>
                          )}
                        </div>

                        {/* Status selektori va Amallar */}
                        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order['status'])}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${
                              ord.status === 'Yangi'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : ord.status === 'Yetkazilmoqda'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : ord.status === 'Bajarildi'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            <option value="Yangi" className="bg-neutral-900 text-white">🟡 Yangi</option>
                            <option value="Yetkazilmoqda" className="bg-neutral-900 text-white">🚚 Yetkazilmoqda</option>
                            <option value="Bajarildi" className="bg-neutral-900 text-white">🟢 Bajarildi</option>
                            <option value="Bekor qilindi" className="bg-neutral-900 text-white">⚪ Bekor qilindi</option>
                          </select>

                          {/* Chop etish (Chek) */}
                          <button
                            onClick={() => handlePrintReceipt(ord)}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Kuryer yoki mijoz uchun chek (nakladnaya) chop etish"
                          >
                            <Printer className="w-3.5 h-3.5 text-neutral-300" />
                            <span className="hidden md:inline">Chek</span>
                          </button>

                          {/* Tafsilotlar */}
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1"
                            title="To'liq tafsilotlarni ko'rish"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-300" />
                            <span className="hidden md:inline">Ko‘rish</span>
                          </button>

                          {/* O'chirish */}
                          <button
                            onClick={() => deleteOrderHandler(ord.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Buyurtmani o'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Mijoz va tovarlar ma'lumotlari */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        {/* Mijoz ma'lumotlari */}
                        <div className="md:col-span-5 space-y-1.5">
                          <div className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold">
                            Mijoz Ma'lumotlari
                          </div>
                          <div className="text-sm font-bold text-white">{ord.customerName}</div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-rose-400" />
                            <a
                              href={`tel:+998${ord.customerPhone.replace(/\D/g, '')}`}
                              className="font-mono text-rose-400 font-bold hover:underline"
                            >
                              +998 {ord.customerPhone}
                            </a>
                          </div>
                          <div className="flex items-start gap-1.5 text-neutral-400">
                            <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                            <span>{ord.customerAddress}</span>
                          </div>
                        </div>

                        {/* Tovarlar ro'yxati */}
                        <div className="md:col-span-7 bg-neutral-900/60 p-3.5 rounded-2xl border border-neutral-800/80">
                          <div className="text-neutral-500 uppercase tracking-wider text-[10px] font-bold mb-2 flex justify-between">
                            <span>Buyurtma Tarkibi</span>
                            <span>{ord.items.length} xil tovar</span>
                          </div>
                          <div className="space-y-2">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {item.image && (
                                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="truncate">
                                    <span className="font-semibold text-neutral-200">{item.name}</span>
                                    {(item.selectedModel || item.selectedColor) && (
                                      <span className="text-[10px] text-neutral-400 block">
                                        {item.selectedModel} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-neutral-400 font-mono">{item.quantity} × {formatPrice(item.price)}</span>
                                  <span className="font-bold text-white block">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 mt-2 border-t border-neutral-800 flex justify-between items-center text-xs">
                            <span className="text-neutral-400">Jami to‘lov:</span>
                            <span className="font-black text-sm text-white">{formatPrice(ord.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MAHSULOTLAR VA OMBOR (7000 CHEXOL VA AKSESSUARLAR) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Qidiruv va Filtr */}
              <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Mahsulot nomi yoki tavsifi bo‘yicha..."
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs sm:text-sm text-white placeholder:text-neutral-500 outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <button
                    onClick={() => setActiveTab('add')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yangi Tovar Qo‘shish</span>
                  </button>
                </div>

                {/* Kategoriyalar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {['Barchasi', ...CATEGORIES.filter((c) => c !== 'Barchasi')].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setProductCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        productCategoryFilter.toLowerCase() === cat.toLowerCase()
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mahsulotlar kartochkalari */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#15171E] p-3 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all shadow-xs flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-neutral-900 mb-2.5 border border-neutral-800/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-bold text-white border border-white/10">
                          {p.category}
                        </span>
                        {p.oldPrice && p.oldPrice > p.price && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-rose-500 text-[9px] font-black text-white">
                            -{Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}%
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
                        {p.name}
                      </h4>

                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="font-black text-xs text-rose-400">{formatPrice(p.price)}</span>
                        {p.oldPrice && (
                          <span className="text-[10px] text-neutral-500 line-through">
                            {formatPrice(p.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-neutral-800 flex items-center justify-between">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Tahrirlash</span>
                      </button>

                      <button
                        onClick={() => deleteProductHandler(p.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: YANGI MAHSULOT QO'SHISH */}
          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto bg-[#15171E] p-6 sm:p-8 rounded-3xl border border-neutral-800 shadow-xl">
              <div className="flex items-center gap-2 mb-1 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Yangi tovar
              </div>
              <h3 className="text-xl font-black text-white mb-1">Katalogga yangi aksessuar qo‘shish</h3>
              <p className="text-xs text-neutral-400 mb-6">
                Bu yerda kiritilgan har qanday yangi tovar darhol mijozlar saytidagi katalogda namoyish etiladi.
              </p>

              <form onSubmit={handleAddProduct} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1.5">
                    Mahsulot to‘liq nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Masalan: MagSafe Premium Shaffof Chexol iPhone 16 Pro"
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-rose-500 outline-none text-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1.5">Kategoriya *</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-rose-500 outline-none text-white cursor-pointer"
                    >
                      {CATEGORIES.filter((c) => c !== 'Barchasi').map((cat) => (
                        <option key={cat} value={cat} className="bg-neutral-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1.5">
                      Sotuv narxi (so‘mda) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="65000"
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-rose-500 outline-none text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1.5">
                      Eski narxi (chegirma bo‘lsa)
                    </label>
                    <input
                      type="number"
                      value={newProdOldPrice}
                      onChange={(e) => setNewProdOldPrice(e.target.value)}
                      placeholder="95000"
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-rose-500 outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-300 mb-1.5">
                      Ombordagi miqdori (dona)
                    </label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      placeholder="50"
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-rose-500 outline-none text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1.5">
                    Mahsulot rasm havolasi (URL)
                  </label>
                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-rose-500 outline-none text-white"
                  />
                  {newProdImage && (
                    <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1.5">
                    Tavsifi va qulayliklari
                  </label>
                  <textarea
                    rows={3}
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    placeholder="Masalan: Yuqori sifatli TPU silikon, sarg'aymaydi, zarbaga qarshi burchakli himoya..."
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-rose-500 outline-none text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mahsulotni Do‘konga Qo‘shish</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: TELEGRAM BOT VA INTEGRATSIYA */}
          {activeTab === 'telegram' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Bot holati kartasi */}
              <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Telegram Bot Holati</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Faol
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400">@xamsiyamarket_bot rasmiy integratsiyasi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block font-bold uppercase">Bot Foydalanuvchi Nomi</span>
                    <a href="https://t.me/xamsiyamarket_bot" target="_blank" className="text-sky-400 font-bold hover:underline">
                      @xamsiyamarket_bot
                    </a>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] block font-bold uppercase">Admin Chat ID</span>
                    <span className="text-white font-mono font-bold">7833585964</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 sm:col-span-2">
                    <span className="text-neutral-500 text-[10px] block font-bold uppercase">Ulangan Webhook Manzili</span>
                    <span className="text-emerald-400 font-mono text-[11px] break-all">
                      https://xamsiyam.vercel.app/api/telegram/webhook
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                  <div className="font-bold text-white">Bot buyruqlari:</div>
                  <div>• <b>/start</b> — Botni ishga tushirish va xush kelibsiz xabari</div>
                  <div>• <b>/orders</b> — Oxirgi 5 ta buyurtmani ko‘rish</div>
                  <div>• <b>/stats</b> — Bugungi savdo va buyurtmalar statistikasi</div>
                </div>
              </div>

              {/* Botga to'g'ridan-to'g'ri xabar jo'natish */}
              <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-white mb-1">Telegramga xabar yoki sinov jo‘natish</h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Ushbu panel orqali do‘kon egasining Telegramiga bevosita eslatma yoki sinov xabari yuborishingiz mumkin.
                </p>

                <form onSubmit={handleSendTelegramMessage} className="space-y-3">
                  <textarea
                    rows={3}
                    required
                    value={tgCustomMsg}
                    onChange={(e) => setTgCustomMsg(e.target.value)}
                    placeholder="Masalan: 🔔 Diqqat: Do'konda yangi aksiya boshlandi!"
                    className="w-full p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 outline-none text-white text-xs resize-none"
                  />

                  {tgStatusMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        tgStatusMsg.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {tgStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{tgStatusMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={tgSending}
                    className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-all shadow-md shadow-sky-500/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{tgSending ? "Yuborilmoqda..." : "Telegramga yuborish"}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: SOZLAMALAR VA XAVFSIZLIK */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-6">
              {/* PIN-kodni o'zgartirish */}
              <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <Key className="w-4 h-4" /> Xavfsizlik
                </div>
                <h3 className="text-base font-bold text-white mb-1">Admin PIN-kodini o‘zgartirish</h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Standart PIN-kod <b>7788</b> o‘rniga o‘zingiz eslab qoladigan yangi maxfiy kod o‘rnating.
                </p>

                <form onSubmit={handleChangePin} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Hozirgi PIN-kod</label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      placeholder="Hozirgi kod"
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white outline-none focus:border-rose-500 font-mono tracking-widest"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Yangi PIN-kod</label>
                      <input
                        type="password"
                        maxLength={6}
                        required
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="Masalan: 1234"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white outline-none focus:border-rose-500 font-mono tracking-widest"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1">Tasdiqlash</label>
                      <input
                        type="password"
                        maxLength={6}
                        required
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="Qayta kiriting"
                        className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white outline-none focus:border-rose-500 font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  {pinChangeMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        pinChangeMsg.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {pinChangeMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{pinChangeMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-[0.99] mt-2"
                  >
                    PIN-kodni Saqlash
                  </button>
                </form>
              </div>

              {/* Do'kon ma'lumotlari */}
              <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Store className="w-4 h-4" /> Do‘kon sozlamalari
                </div>
                <h3 className="text-base font-bold text-white mb-3">Do‘kon Aloqa Ma'lumotlari</h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                    <span className="text-neutral-400">Do‘kon nomi:</span>
                    <span className="font-bold text-white">Xamsiya Market</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                    <span className="text-neutral-400">Aloqa telefoni:</span>
                    <span className="font-bold text-white font-mono">+998 (20) 019-18-09</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                    <span className="text-neutral-400">Manzil:</span>
                    <span className="font-bold text-white">Yakkabog‘ tumani markazi</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                    <span className="text-neutral-400">Yetkazib berish:</span>
                    <span className="font-bold text-emerald-400">Tuman bo‘ylab bepul</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* BUYURTMA TAFSILOTLARI MODALI */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="font-mono text-xs font-black text-rose-400">#{selectedOrder.id}</span>
                <h3 className="text-base font-bold text-white">Buyurtma Tafsilotlari</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="text-neutral-400 text-[10px] font-bold uppercase">Mijoz</div>
                <div className="text-base font-bold text-white">{selectedOrder.customerName}</div>
                <div className="text-rose-400 font-mono font-bold">+998 {selectedOrder.customerPhone}</div>
                <div className="text-neutral-300">{selectedOrder.customerAddress}</div>
                {selectedOrder.comment && (
                  <div className="mt-2 pt-2 border-t border-neutral-800 text-amber-300">
                    <b>Izoh:</b> {selectedOrder.comment}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-neutral-400 text-[10px] font-bold uppercase">Tovarlar ({selectedOrder.items.length})</div>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {it.image && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white">{it.name}</div>
                        <div className="text-[11px] text-neutral-400">
                          {it.selectedModel ? `Model: ${it.selectedModel}` : ''} {it.selectedColor ? `• Rang: ${it.selectedColor}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-neutral-400">{it.quantity} dona</div>
                      <div className="font-bold text-white">{formatPrice(it.price * it.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-sm font-black">
                <span className="text-neutral-400">Jami to‘lov:</span>
                <span className="text-white text-base">{formatPrice(selectedOrder.totalPrice)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handlePrintReceipt(selectedOrder)}
                className="flex-1 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Chek chop etish
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAHSULOTNI TAHRIRLASH MODALI */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#15171E] border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <span>Mahsulotni Tahrirlash</span>
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Nomi</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Narxi (so‘m)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Eski narxi</label>
                  <input
                    type="number"
                    value={editingProduct.oldPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Rasm havolasi (URL)</label>
                <input
                  type="url"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Tavsifi</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
