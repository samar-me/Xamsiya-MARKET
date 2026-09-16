'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Phone,
  ArrowRight,
  Star,
  Send,
  Loader2,
  User,
  UserCheck,
  Home,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import {
  Product,
  PRODUCTS,
  CATEGORIES,
  CATEGORY_DETAILS,
  formatPrice
} from '../../lib/products';

interface CartItem extends Product {
  quantity: number;
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

interface UserProfile {
  name: string;
  phone: string;
  address?: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount: string;
  desc: string;
}

const INITIAL_PROMOS: PromoCode[] = [
  { id: '1', code: 'XAMSIYA10', discount: '10% chegirma', desc: 'Barcha chexol va aksessuarlarga' },
  { id: '2', code: 'YANGI2025', discount: '25 000 so‘m', desc: 'Birinchi buyurtmangiz uchun maxsus sovg‘a' },
  { id: '3', code: 'YAKKABOG', discount: 'Bepul yetkazish', desc: 'Yakkabog‘ tumani bo‘ylab mutlaqo bepul' },
];

function CategoriesContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat');

  const [mounted, setMounted] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  // Savatcha
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Mijoz profili
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authName, setAuthName] = useState<string>('');
  const [authPhone, setAuthPhone] = useState<string>('');
  const [authAddress, setAuthAddress] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [profileTab, setProfileTab] = useState<'menu' | 'orders' | 'edit-profile' | 'promocodes' | 'settings'>('menu');

  // Promokodlar
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [newPromoInput, setNewPromoInput] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<string>('');

  // Profil tahrirlash
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editSuccessMsg, setEditSuccessMsg] = useState<string>('');

  // Sozlamalar
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [appLanguage, setAppLanguage] = useState<string>('O‘zbekcha (Lotin)');

  // Buyurtma formasi
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [orderComment, setOrderComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Buyurtmalar
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    setMounted(true);

    if (catParam) {
      const match = CATEGORIES.find(c => c.toLowerCase() === catParam.toLowerCase());
      if (match) setSelectedCategory(match);
    }

    try {
      const savedCart = localStorage.getItem('xamsiya_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedUser = localStorage.getItem('xamsiya_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setCustomerName(parsed.name || '');
        setCustomerPhone(parsed.phone || '');
        setCustomerAddress(parsed.address || '');
      }

      const savedOrders = localStorage.getItem('xamsiya_orders');
      if (savedOrders) setAllOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error(e);
    }
  }, [catParam]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('xamsiya_cart', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const myOrders = useMemo(() => {
    if (!user) return [];
    const cleanUserPhone = user.phone.replace(/\D/g, '');
    return allOrders.filter((ord) => {
      const cleanOrdPhone = ord.customerPhone.replace(/\D/g, '');
      return cleanOrdPhone === cleanUserPhone || ord.customerName.toLowerCase() === user.name.toLowerCase();
    });
  }, [allOrders, user]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Filtrlash va saralash
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter((product) => {
      const matchesCat =
        selectedCategory === 'Barchasi' || product.category === selectedCategory;
      const matchesQuery =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  const activeCategoryDetail = useMemo(() => {
    if (selectedCategory === 'Barchasi') return null;
    return CATEGORY_DETAILS.find(
      (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authPhone.trim()) {
      alert("Iltimos, ismingiz va telefon raqamingizni to'liq kiriting!");
      return;
    }
    const newUser: UserProfile = {
      name: authName.trim(),
      phone: authPhone.trim(),
      address: authAddress.trim(),
    };
    setUser(newUser);
    localStorage.setItem('xamsiya_user', JSON.stringify(newUser));
    setCustomerName(newUser.name);
    setCustomerPhone(newUser.phone);
    setCustomerAddress(newUser.address || '');
    setIsAuthModalOpen(false);
    setEditName(newUser.name);
    setEditPhone(newUser.phone);
    setEditAddress(newUser.address || '');
    setProfileTab('menu');
    setIsProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      alert("Iltimos, ism va telefon raqamingizni kiriting!");
      return;
    }
    const updatedUser: UserProfile = {
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
    };
    setUser(updatedUser);
    localStorage.setItem('xamsiya_user', JSON.stringify(updatedUser));
    setCustomerName(updatedUser.name);
    setCustomerPhone(updatedUser.phone);
    setCustomerAddress(updatedUser.address || '');
    setEditSuccessMsg("Ma’lumotlaringiz muvaffaqiyatli saqlandi! ✅");
    setTimeout(() => {
      setEditSuccessMsg('');
      setProfileTab('menu');
    }, 1000);
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newPromoInput.trim().toUpperCase();
    if (!cleanCode) return;
    if (promos.some((p) => p.code === cleanCode)) {
      setPromoMessage("Bu promokod allaqachon faollashtirilgan!");
      return;
    }
    const newPromo: PromoCode = {
      id: Date.now().toString(),
      code: cleanCode,
      discount: "15% chegirma",
      desc: "Yangi qo‘shilgan demo promokod",
    };
    setPromos([newPromo, ...promos]);
    setNewPromoInput('');
    setPromoMessage(`🎉 "${cleanCode}" promokodi muvaffaqiyatli qo‘shildi!`);
    setTimeout(() => setPromoMessage(''), 3000);
  };

  const handleLogout = () => {
    if (confirm("Hisobingizdan chiqmoqchimisiz?")) {
      setUser(null);
      localStorage.removeItem('xamsiya_user');
      setIsProfileOpen(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Iltimos, ismingiz va telefon raqamingizni kiriting!");
      return;
    }
    if (cart.length === 0) {
      alert("Savatchangiz bo'sh!");
      return;
    }
    setIsSubmitting(true);
    const newOrder: Order = {
      id: 'XM-' + Math.floor(100000 + Math.random() * 900000),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || "Yakkabog' tumani (Do'kondan olib ketish)",
      items: [...cart],
      totalPrice: totalCartPrice,
      status: 'Yangi',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrder,
          comment: orderComment.trim()
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xatolik yuz berdi');

      const updatedOrders = [newOrder, ...allOrders];
      setAllOrders(updatedOrders);
      localStorage.setItem('xamsiya_orders', JSON.stringify(updatedOrders));

      if (!user) {
        const autoUser: UserProfile = {
          name: newOrder.customerName,
          phone: newOrder.customerPhone,
          address: newOrder.customerAddress
        };
        setUser(autoUser);
        localStorage.setItem('xamsiya_user', JSON.stringify(autoUser));
      }

      setCart([]);
      setIsCheckoutOpen(false);
      setOrderSuccess(true);
    } catch (err: any) {
      alert("Buyurtma yuborishda xatolik: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <div className="w-5 h-5 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
          <span>Kategoriyalar yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-neutral-950 selection:text-white font-sans antialiased w-full max-w-full overflow-x-clip pb-20 sm:pb-12">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/70 shadow-xs transition-all w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          <a href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-200/90 bg-white p-0.5 sm:p-1 shadow-sm group-hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Xamsiya Market Logotipi" className="w-full h-full object-contain drop-shadow-xs" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-neutral-950 block leading-tight truncate">
                Xamsiya <span className="font-light text-neutral-400">Market</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 hidden sm:block">
                Kategoriyalar Vitrinasi
              </span>
            </div>
          </a>

          {/* Menyu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="/" className="hover:text-neutral-950 transition-colors">
              Bosh sahifa
            </a>
            <a href="/categories" className="text-neutral-950 font-bold flex items-center gap-1.5">
              <span>Kategoriyalar</span>
              <span className="px-1.5 py-0.5 rounded-full bg-neutral-900 text-white text-[10px]">6 toifa</span>
            </a>
            <a href="/#chegirmalar" className="hover:text-neutral-950 transition-colors">
              Chegirmalar
            </a>
            <a href="/#aloqa" className="hover:text-neutral-950 transition-colors">
              Bog‘lanish
            </a>
          </nav>

          {/* Savatcha va Kabinet */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a
              href="tel:+998200191809"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full border border-neutral-200/80 hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 text-xs font-semibold transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>+998 (20) 019-18-09</span>
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-full bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition-all shadow-sm active:scale-95 shrink-0"
              aria-label="Savatcha"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Savatcha</span>
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-neutral-950 text-[10px] sm:text-xs font-bold flex items-center justify-center">
                {totalCartCount}
              </span>
            </button>

            {user ? (
              <button
                onClick={() => {
                  setEditName(user.name);
                  setEditPhone(user.phone);
                  setEditAddress(user.address || '');
                  setProfileTab('menu');
                  setIsProfileOpen(true);
                }}
                className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold transition-all shrink-0"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
                {myOrders.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                    {myOrders.length}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthName('');
                  setAuthPhone('');
                  setAuthAddress('');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full border border-neutral-200 hover:border-neutral-900 text-neutral-800 text-xs font-semibold transition-all shrink-0"
              >
                <User className="w-4 h-4 text-neutral-600" />
                <span className="hidden sm:inline">Kabinet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. BREADCRUMBS & SAHIFA SARLAVHASI */}
      <section className="bg-white border-b border-neutral-200/80 py-6 sm:py-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
            <a href="/" className="hover:text-neutral-900 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Bosh sahifa</span>
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
            <button
              onClick={() => setSelectedCategory('Barchasi')}
              className={selectedCategory === 'Barchasi' ? 'text-neutral-900 font-bold' : 'hover:text-neutral-900'}
            >
              Kategoriyalar
            </button>
            {selectedCategory !== 'Barchasi' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
                <span className="text-neutral-900 font-bold">{selectedCategory}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                <span>Maxsus toifalar katalogi</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
                {selectedCategory === 'Barchasi'
                  ? 'Barcha Telefon Aksessuarlari Toifalari'
                  : activeCategoryDetail?.title || `${selectedCategory} aksessuarlari`}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
                {selectedCategory === 'Barchasi'
                  ? "Smartfoningiz uchun kerakli bo'lgan barcha asl sifatli aksessuarlarni toifalarga bo'lingan holda tanlang va xarid qiling."
                  : activeCategoryDetail?.shortDesc || `${selectedCategory} toifasidagi eng sara mahsulotlar.`}
              </p>
            </div>

            {/* Qidiruv satri */}
            <div className="w-full md:w-80 relative">
              <div className="relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 focus-within:border-neutral-900 transition-all p-1">
                <div className="pl-3 pr-2 text-neutral-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Katalog ichidan qidiring..."
                  className="w-full py-2 bg-transparent text-xs sm:text-sm outline-none text-neutral-900 placeholder:text-neutral-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 text-neutral-400 hover:text-neutral-700 mr-1">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Kategoriya pills (gorizontal siljish) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. AGAR "BARCHASI" TANLANGAN BO'LSA: KATTA KO'RGANLI KATEGORIYA KARTALARI (SHOWCASE) */}
      {selectedCategory === 'Barchasi' && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
                Toifalar bo‘yicha tanlang
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Har bir kategoriya uchun moslashtirilgan original mahsulotlar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {CATEGORY_DETAILS.map((detail) => (
              <div
                key={detail.id}
                onClick={() => setSelectedCategory(detail.name)}
                className="group relative bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs hover:shadow-xl hover:border-neutral-400 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Rasm qismi */}
                <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={detail.image}
                    alt={detail.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-neutral-900 shadow-xs">
                      {detail.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-neutral-300 font-bold block">
                        {detail.name}
                      </span>
                      <h3 className="text-lg font-black leading-snug drop-shadow-xs">
                        {detail.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Tavsif va tugma */}
                <div className="p-5 flex flex-col justify-between flex-1 bg-white">
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-4">
                    {detail.shortDesc}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <span className="text-xs font-semibold text-neutral-700">
                      {detail.itemCount}+ xil mahsulot
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-950 group-hover:translate-x-1 transition-transform">
                      Katalogga o‘tish
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. MAHSULOTLAR GRIDI (SARALASH VA MAHSULOTLAR RO'YXATI) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-200/80">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950">
              {selectedCategory === 'Barchasi' ? 'Barcha tovarlar' : `${selectedCategory} mahsulotlari`}
            </h2>
            <p className="text-xs text-neutral-500">
              {filteredProducts.length} ta mahsulot mavjud
            </p>
          </div>

          {/* Saralash (Sort) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Saralash:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 outline-none hover:border-neutral-400 focus:border-neutral-900 transition-all cursor-pointer"
            >
              <option value="popular">Eng ommabop</option>
              <option value="price-asc">Narxi: Arzondan qimmatga</option>
              <option value="price-desc">Narxi: Qimmatdan arzonga</option>
              <option value="rating">Reytingi bo‘yicha</option>
            </select>
          </div>
        </div>

        {/* Mahsulotlar kartalari */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-200 p-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">Hech qanday mahsulot topilmadi</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              Qidiruv so‘rovingizni o‘zgartiring yoki boshqa toifani tanlang.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Barchasi');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800"
            >
              Barcha mahsulotlar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.id === product.id);
              const discountPercent = product.oldPrice
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/80 p-2.5 sm:p-4 flex flex-col justify-between hover:shadow-xl hover:border-neutral-300 transition-all duration-300"
                >
                  <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 mb-3 sm:mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Belgilar */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] sm:text-xs font-bold tracking-tight shadow-xs">
                          -{discountPercent}%
                        </span>
                      )}
                      {product.isPopular && (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                          Top
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ma'lumotlar */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-neutral-400 mb-1">
                        <span className="font-semibold uppercase tracking-wider text-neutral-500">
                          {product.category}
                        </span>
                        <span className="flex items-center gap-0.5 font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {product.rating}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug line-clamp-2 group-hover:text-neutral-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 hidden sm:block">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 sm:pt-4 border-t border-neutral-100 mt-3 sm:mt-4 flex items-center justify-between gap-1.5">
                      <div className="min-w-0">
                        {product.oldPrice && (
                          <span className="text-[10px] sm:text-xs text-neutral-400 line-through block truncate">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                        <span className="text-xs sm:text-base font-extrabold text-neutral-950 block truncate">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 shrink-0">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-neutral-700 hover:bg-neutral-200 active:scale-95 text-xs font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-neutral-900">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-6 h-6 rounded-lg bg-neutral-950 text-white flex items-center justify-center hover:bg-neutral-800 active:scale-95 text-xs font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Savatga</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SAVATCHA MODALI (DRAWER) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-neutral-950" />
                  <h2 className="text-lg font-bold text-neutral-950">Xaridlar savati</h2>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                    {totalCartCount} ta tovar
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-neutral-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3 text-neutral-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-neutral-900 text-base">Savatchangiz bo‘sh</h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                      Telefoningiz uchun qulay chexol, tezkor zaryadlovchi yoki 9D shisha tanlang.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-5 px-5 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800"
                    >
                      Katalogdan tanlash
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-4 flex gap-3 sm:gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs font-bold text-neutral-950 mt-1">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center bg-neutral-100 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 rounded bg-white flex items-center justify-center text-xs font-bold"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 rounded bg-neutral-950 text-white flex items-center justify-center text-xs font-bold"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 sm:p-6 border-t border-neutral-100 bg-neutral-50/50">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Mahsulotlar soni</span>
                      <span className="font-semibold text-neutral-900">{totalCartCount} ta</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Yetkazib berish (Yakkabog‘)</span>
                      <span className="font-semibold text-emerald-600">Bepul</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-neutral-950 pt-2 border-t border-neutral-200">
                      <span>Jami to‘lov:</span>
                      <span>{formatPrice(totalCartPrice)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-neutral-950 text-white font-bold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-neutral-950/10"
                  >
                    <span>Buyurtmani rasmiylashtirish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODALI */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Xamsiya Market</span>
              <h3 className="text-xl font-black text-neutral-950 mt-1">Buyurtmani tasdiqlash</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ma‘lumotlaringiz to‘g‘ridan-to‘g‘ri do‘kon Telegram botiga yuboriladi.
              </p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Ismingiz va Familiyangiz *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masalan: Azizbek Karimov"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Telefon raqamingiz *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Yetkazib berish manzili
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Qashqadaryo viloyati, Yakkabog‘ tumani..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Qo‘shimcha izoh (ixtiyoriy)
                </label>
                <textarea
                  value={orderComment}
                  onChange={(e) => setOrderComment(e.target.value)}
                  placeholder="Modeli yoki maxsus talablar..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-neutral-950 resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-500">Jami ({totalCartCount} ta tovar):</span>
                <span className="font-extrabold text-neutral-950 text-sm">
                  {formatPrice(totalCartPrice)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-neutral-950 text-white font-bold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Telegram orqali buyurtma berish</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MUVAFFAQIYAT MODALI */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-neutral-950">Rahmat! Buyurtmangiz qabul qilindi</h3>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Buyurtma ma‘lumotlari do‘konimizga yetib bordi. Tez orada operatorimiz siz bilan bog‘lanadi.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  setProfileTab('orders');
                  setIsProfileOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs hover:bg-neutral-800 transition-all"
              >
                Buyurtmalarimni kuzatish
              </button>
              <button
                onClick={() => setOrderSuccess(false)}
                className="w-full py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-xs hover:bg-neutral-50"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RO'YXATDAN O'TISH / KIRISH MODALI */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-5">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-2">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-neutral-950">Mijoz Kabinetiga Kirish</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Buyurtmalaringiz holatini kuzatish va promokodlardan foydalanish uchun ma‘lumotlaringizni kiriting.
              </p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Ismingiz va Familiyangiz *
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Masalan: Sardor Aliyev"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-neutral-950"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Telefon raqamingiz *
                </label>
                <input
                  type="tel"
                  required
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-neutral-950"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Manzilingiz (Qashqadaryo, Yakkabog‘)
                </label>
                <input
                  type="text"
                  value={authAddress}
                  onChange={(e) => setAuthAddress(e.target.value)}
                  placeholder="Mahalla, ko‘cha yoki mo‘ljal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm outline-none focus:border-neutral-950"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-2xl bg-neutral-950 text-white font-bold text-xs sm:text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
              >
                <span>Kirish va Saqlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* KABINET DRAWER */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsProfileOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {profileTab !== 'menu' && (
                    <button
                      onClick={() => setProfileTab('menu')}
                      className="p-1 -ml-1 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <h2 className="text-lg font-bold text-neutral-950">
                    {profileTab === 'menu' && "Shaxsiy Kabinet"}
                    {profileTab === 'orders' && "Buyurtmalarim"}
                    {profileTab === 'edit-profile' && "Profilni tahrirlash"}
                    {profileTab === 'promocodes' && "Promokodlarim"}
                    {profileTab === 'settings' && "Sozlamalar"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {profileTab === 'menu' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-neutral-950 text-white flex items-center justify-center font-bold text-lg">
                        {user ? user.name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-neutral-950 truncate">
                          {user ? user.name : 'Hurmatli mijoz'}
                        </h3>
                        <p className="text-xs text-neutral-500 truncate">
                          {user ? user.phone : 'Telefon raqam kiritilmagan'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => setProfileTab('orders')}
                        className="w-full p-4 rounded-2xl border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50 flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">Buyurtmalarim</span>
                            <span className="text-[11px] text-neutral-400">
                              {myOrders.length > 0 ? `${myOrders.length} ta faol buyurtma` : 'Tarix va jonli status'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </button>

                      <button
                        onClick={() => setProfileTab('edit-profile')}
                        className="w-full p-4 rounded-2xl border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50 flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">Profil ma‘lumotlari</span>
                            <span className="text-[11px] text-neutral-400">Ism, telefon va yetkazish manzili</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </button>

                      <button
                        onClick={() => setProfileTab('promocodes')}
                        className="w-full p-4 rounded-2xl border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50 flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">Promokodlarim</span>
                            <span className="text-[11px] text-neutral-400">{promos.length} ta faol chegirma</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </button>

                      <button
                        onClick={() => setProfileTab('settings')}
                        className="w-full p-4 rounded-2xl border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50 flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">Sozlamalar</span>
                            <span className="text-[11px] text-neutral-400">Bildirishnoma va til</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
                      >
                        Hisobdan chiqish
                      </button>
                    </div>
                  </div>
                )}

                {/* BUYURTMALARIM */}
                {profileTab === 'orders' && (
                  <div className="space-y-4">
                    {myOrders.length === 0 ? (
                      <div className="text-center py-10">
                        <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                        <h4 className="text-xs font-bold text-neutral-800">Sizda hali buyurtmalar yo‘q</h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Katalogimizdan o‘zingizga ma‘qul aksessuarni tanlang.
                        </p>
                      </div>
                    ) : (
                      myOrders.map((ord) => (
                        <div key={ord.id} className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-neutral-900">{ord.id}</span>
                            <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-semibold">
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500 space-y-1">
                            {ord.items.map((it) => (
                              <div key={it.id} className="flex justify-between">
                                <span className="truncate max-w-[200px]">{it.name} x {it.quantity}</span>
                                <span className="font-semibold text-neutral-800">{formatPrice(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-neutral-200 flex justify-between text-xs font-extrabold text-neutral-950">
                            <span>Jami summa:</span>
                            <span>{formatPrice(ord.totalPrice)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* PROFILNI TAHRIRLASH */}
                {profileTab === 'edit-profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {editSuccessMsg && (
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                        {editSuccessMsg}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Ism va Familiya</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs outline-none focus:border-neutral-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Telefon raqam</label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs outline-none focus:border-neutral-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">Yetkazib berish manzili</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs outline-none focus:border-neutral-950"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-all"
                    >
                      Saqlash
                    </button>
                  </form>
                )}

                {/* PROMOKODLAR */}
                {profileTab === 'promocodes' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddPromo} className="flex gap-2">
                      <input
                        type="text"
                        value={newPromoInput}
                        onChange={(e) => setNewPromoInput(e.target.value)}
                        placeholder="Promokod kodi..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs outline-none uppercase font-bold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800"
                      >
                        Qo‘shish
                      </button>
                    </form>
                    {promoMessage && (
                      <p className="text-xs text-emerald-600 font-medium">{promoMessage}</p>
                    )}
                    <div className="space-y-2.5">
                      {promos.map((p) => (
                        <div key={p.id} className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-black text-neutral-950 text-xs tracking-wider block">{p.code}</span>
                            <span className="text-[11px] text-neutral-500">{p.desc}</span>
                          </div>
                          <span className="px-2 py-1 rounded-md bg-white border border-neutral-200 text-[11px] font-bold text-emerald-600">
                            {p.discount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SOZLAMALAR */}
                {profileTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-neutral-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-neutral-900 block">Bildirishnomalar</span>
                          <span className="text-[11px] text-neutral-400">SMS va Telegram orqali xabar</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationsEnabled}
                          onChange={(e) => setNotificationsEnabled(e.target.checked)}
                          className="w-4 h-4 accent-neutral-950 cursor-pointer"
                        />
                      </div>
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-neutral-900 block">Ilova tili</span>
                          <span className="text-[11px] text-neutral-400">{appLanguage}</span>
                        </div>
                        <span className="text-xs font-semibold text-neutral-500">UZ</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MOBIL BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 sm:hidden py-2 px-6 flex items-center justify-around shadow-lg">
        <a href="/" className="flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-900">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Asosiy</span>
        </a>

        <a href="/categories" className="flex flex-col items-center gap-1 text-neutral-950">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-bold">Katalog</span>
        </a>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-900 relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Savat</span>
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-neutral-950 text-white text-[10px] font-bold flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (user) {
              setEditName(user.name);
              setEditPhone(user.phone);
              setEditAddress(user.address || '');
              setProfileTab('menu');
              setIsProfileOpen(true);
            } else {
              setAuthName('');
              setAuthPhone('');
              setAuthAddress('');
              setIsAuthModalOpen(true);
            }
          }}
          className="flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-900 relative"
        >
          {user ? (
            <UserCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium">Kabinet</span>
          {myOrders.length > 0 && (
            <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-neutral-900 text-white text-[9px] font-bold flex items-center justify-center">
              {myOrders.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
      <CategoriesContent />
    </Suspense>
  );
}
