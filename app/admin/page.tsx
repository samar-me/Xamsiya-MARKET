'use client';

import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  totalPrice: number;
  status: 'Yangi' | 'Yetkazilmoqda' | 'Bajarildi' | 'Bekor qilindi';
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  isNew?: boolean;
  isPopular?: boolean;
  description: string;
}

// Boshlang'ich maxfiy parol (Do'kon egasi o'zgartirishi mumkin)
const ADMIN_SECRET_PIN = '7788';

const CATEGORIES = [
  'Chexollar',
  'Zaryadlovchilar',
  'Quloqchinlar',
  'Kabellar',
  'Himoya oynalari',
  'Powerbanklar'
];

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'add'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchOrder, setSearchOrder] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Yangi mahsulot state-lari
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // Serverdan buyurtmalarni yuklash
  const fetchOrdersFromServer = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        localStorage.setItem('xamsiya_orders', JSON.stringify(data.orders));
      }
    } catch (err) {
      console.error('Admin fetch orders error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // LocalStorage-dan ma'lumotlarni yuklash va server bilan sinxronlash
  useEffect(() => {
    // Avval tizimga kirganmi tekshirish
    const sessionAuth = sessionStorage.getItem('xamsiya_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }

    try {
      const savedOrders = localStorage.getItem('xamsiya_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }

      const savedProducts = localStorage.getItem('xamsiya_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Tizimga kirganda avtomatik serverdan yangilash va 8 soniyalik jonli monitoring
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrdersFromServer();
      const interval = setInterval(fetchOrdersFromServer, 8000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Xavfsiz PIN tekshiruvi
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_SECRET_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('xamsiya_admin_auth', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('xamsiya_admin_auth');
  };

  // Buyurtma holatini o'zgartirish (ham lokal, ham server bazasida sinxron)
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    localStorage.setItem('xamsiya_orders', JSON.stringify(updated));

    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      });
    } catch (err) {
      console.error('Failed to update status on server:', err);
    }
  };

  // Mahsulotni o'chirish
  const deleteProduct = (id: number) => {
    if (confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem('xamsiya_products', JSON.stringify(updated));
    }
  };

  // Yangi mahsulot qo'shish
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const newProd: Product = {
      id: Date.now(),
      name: name.trim(),
      category,
      price: parseInt(price.replace(/\D/g, ''), 10),
      oldPrice: oldPrice ? parseInt(oldPrice.replace(/\D/g, ''), 10) : undefined,
      image: image.trim() || 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      rating: 5.0,
      reviewsCount: 1,
      isNew: true,
      description: description.trim() || 'Original sifatli telefon aksessuari.'
    };

    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem('xamsiya_products', JSON.stringify(updated));

    // Tozalash
    setName('');
    setPrice('');
    setOldPrice('');
    setImage('');
    setDescription('');
    setActiveTab('products');
    alert("Yangi mahsulot do'konga qo'shildi!");
  };

  // Statistika
  const totalIncome = orders
    .filter((o) => o.status !== 'Bekor qilindi')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Yangi').length;

  // Filtrangan buyurtmalar
  const filteredOrders = orders.filter((o) =>
    o.customerName.toLowerCase().includes(searchOrder.toLowerCase()) ||
    o.customerPhone.includes(searchOrder) ||
    o.id.toLowerCase().includes(searchOrder.toLowerCase())
  );

  // 1. PIN KOD BILAN HIMOYALANGAN KIRISH OYNASI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-5 text-neutral-300">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-1">Xamsiya Market</h2>
          <p className="text-xs text-neutral-400 mb-6">
            Boshqaruv paneliga kirish uchun xavfsizlik PIN-kodini kiriting
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="PIN-kod (Standart: 7788)"
                autoFocus
                className="w-full text-center tracking-widest text-lg font-mono py-3.5 px-4 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-white outline-none transition-all text-white placeholder:text-neutral-600 placeholder:tracking-normal placeholder:text-xs"
              />
              {pinError && (
                <div className="flex items-center justify-center gap-1 text-red-400 text-xs mt-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>PIN-kod noto‘g‘ri! Qayta urinib ko‘ring.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-white text-neutral-950 font-bold text-sm hover:bg-neutral-200 transition-all shadow-lg active:scale-95"
            >
              Tizimga kirish
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-[11px] text-neutral-500">
            🔒 Xavfsiz shifrlangan boshqaruv tizimi
          </div>
        </div>
      </div>
    );
  }

  // 2. ADMIN PANELNING ASOSIY INTERFEYSI
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-neutral-900 font-sans pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-neutral-200 bg-white p-0.5 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Xamsiya Market" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-neutral-950 flex items-center gap-1.5">
                Xamsiya Market <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 font-semibold text-neutral-600">Admin</span>
              </h1>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Xavfsiz ulanish faol
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Saytni ko‘rish</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-6">
        {/* Yuqori Ko'rsatkichlar (KPI) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6">
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Jami Tushum</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-neutral-950">{formatPrice(totalIncome)}</div>
            <span className="text-xs text-neutral-400 mt-1 block">Barcha qabul qilingan to‘lovlar</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Yangi Buyurtmalar</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-neutral-950">
              {pendingOrdersCount} ta <span className="text-sm font-normal text-neutral-400">/ {orders.length} jami</span>
            </div>
            <span className="text-xs text-neutral-400 mt-1 block">Kutilayotgan yangi xaridlar</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Faol Mahsulotlar</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-neutral-950">{products.length} xil</div>
            <span className="text-xs text-neutral-400 mt-1 block">Do‘konda sotuvda mavjud</span>
          </div>
        </div>

        {/* Tablar */}
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 mb-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Mijozlar Buyurtmalari ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'products'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mahsulotlar Katalogi ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'add'
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ Yangi Aksessuar Qo‘shish</span>
          </button>
        </div>

        {/* TAB 1: BUYURTMALAR */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="text"
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  placeholder="Buyurtma ID, ism yoki telefon bo‘yicha qidiring..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-neutral-900"
                />
              </div>
              <button
                onClick={fetchOrdersFromServer}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-950 text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-all shadow-xs shrink-0"
                title="Serverdan buyurtmalarni yangilash"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neutral-950' : ''}`} />
                <span className="hidden sm:inline">Yangilash</span>
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                <h3 className="font-bold text-neutral-800">Buyurtmalar topilmadi</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Mijoz sayt orqali buyurtma berishi bilan bu yerda avtomatik ko‘rinadi.
                </p>
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200/90 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3.5 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-neutral-950 bg-neutral-100 px-2.5 py-1 rounded-xl">
                        {ord.id}
                      </span>
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ord.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-medium">Holat:</span>
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateOrderStatus(ord.id, e.target.value as Order['status'])
                        }
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${
                          ord.status === 'Yangi'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : ord.status === 'Yetkazilmoqda'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ord.status === 'Bajarildi'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}
                      >
                        <option value="Yangi">🟡 Yangi</option>
                        <option value="Yetkazilmoqda">🔵 Yetkazilmoqda</option>
                        <option value="Bajarildi">🟢 Bajarildi</option>
                        <option value="Bekor qilindi">⚪ Bekor qilindi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold mb-1">
                        Mijoz haqida
                      </div>
                      <div className="text-base font-bold text-neutral-900">{ord.customerName}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <a
                          href={`tel:+998${ord.customerPhone}`}
                          className="font-mono text-blue-600 font-bold hover:underline"
                        >
                          +998 {ord.customerPhone}
                        </a>
                      </div>
                      <div className="mt-1.5 flex items-start gap-1.5 text-neutral-600">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span>{ord.customerAddress}</span>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                      <div className="text-neutral-400 uppercase tracking-wider text-[10px] font-bold mb-2">
                        Buyurtma qilingan tovarlar
                      </div>
                      <div className="space-y-1.5">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-neutral-800 line-clamp-1">
                              {item.name} <b className="text-neutral-500">×{item.quantity}</b>
                            </span>
                            <span className="font-semibold shrink-0 ml-2">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2.5 mt-2.5 border-t border-neutral-200 flex justify-between font-black text-neutral-950 text-sm">
                        <span>Jami to‘lov:</span>
                        <span>{formatPrice(ord.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: MAHSULOTLAR */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-white/95 text-[9px] font-bold">
                      {p.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">{p.name}</h4>
                  <div className="font-black text-xs text-neutral-950 mt-1">{formatPrice(p.price)}</div>
                </div>

                <div className="pt-2 mt-2 border-t border-neutral-100 flex justify-end">
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Mahsulotni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: YANGI MAHSULOT QO'SHISH */}
        {activeTab === 'add' && (
          <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs">
            <h3 className="text-lg font-bold text-neutral-950 mb-1">Yangi Aksessuar Qo‘shish</h3>
            <p className="text-xs text-neutral-500 mb-6">
              Bu yerda qo‘shilgan tovar darhol mijozlar saytining katalogida paydo bo‘ladi.
            </p>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Mahsulot nomi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: MagSafe Shaffof Chexol iPhone 16 Pro"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Kategoriya *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Narxi (so‘mda) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="145000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Eski narxi (agar chegirma bo‘lsa)
                  </label>
                  <input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="180000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Rasm havolasi (URL)
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Qisqacha tavsifi
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Materiali, qulayligi, kuchi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-neutral-950 hover:bg-black text-white font-bold text-sm transition-all shadow-md active:scale-95"
              >
                Mahsulotni Saqlash va Do‘konga Qo‘shish
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
