'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Headphones,
  Zap,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Send,
  Loader2,
  User,
  LogOut,
  Package,
  PackageCheck,
  ChevronRight,
  UserCheck,
  Home,
  LayoutGrid,
  Ticket,
  Settings as SettingsIcon,
  ChevronLeft,
  Sparkles,
  Check,
  Flame,
  Gift,
  Smartphone,
  Boxes,
  Tag,
  Palette
} from 'lucide-react';
import {
  Product,
  CASE_COLORS,
  PRODUCTS,
  CATEGORIES,
  CATEGORY_DETAILS,
  PHONE_BRANDS,
  formatPrice
} from '../lib/products';

export interface CartItem extends Product {
  quantity: number;
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
}

export interface UserProfile {
  name: string;
  phone: string;
  address?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: string;
  desc: string;
}

const INITIAL_PROMOS: PromoCode[] = [
  { id: '1', code: 'XAMSIYA10', discount: '10% chegirma', desc: 'Barcha chexol va aksessuarlarga' },
  { id: '2', code: 'CHEXOL7000', discount: '2+1 Aksiya & Sovg‘a', desc: '7 000 ta chexollar mega likvidatsiyasi uchun' },
  { id: '3', code: 'YANGI2025', discount: '25 000 so‘m', desc: 'Birinchi buyurtmangiz uchun maxsus sovg‘a' },
  { id: '4', code: 'YAKKABOG', discount: 'Bepul yetkazish', desc: 'Yakkabog‘ tumani bo‘ylab mutlaqo bepul' },
];

export default function XamsiyaMarketPage() {
  const [mounted, setMounted] = useState<boolean>(false);

  // Telefon modeli tanlagich (7 000 chexol uchun)
  const [selectedBrand, setSelectedBrand] = useState<string>('apple');
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Rang tanlash (har bir tovar uchun)
  const [selectedColors, setSelectedColors] = useState<Record<number, string>>({});

  // 1-bosishda tezkor xarid modali
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [quickName, setQuickName] = useState<string>('');
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickAddress, setQuickAddress] = useState<string>('');
  const [quickColor, setQuickColor] = useState<string>('Qora (Black)');
  const [quickModel, setQuickModel] = useState<string>('');
  const [isQuickSubmitting, setIsQuickSubmitting] = useState<boolean>(false);
  const [orderComment, setOrderComment] = useState<string>('');

  // Kategoriya va qidiruv
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Savatcha
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // --- MIJOZ PROFILI VA RO'YXATDAN O'TISH ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authName, setAuthName] = useState<string>('');
  const [authPhone, setAuthPhone] = useState<string>('');
  const [authAddress, setAuthAddress] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // --- KABINET TURLI BO'LIMLARI ---
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

  // Buyurtmalar bazasi
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Buyurtma formasi
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Yuborish holatlari
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [telegramStatus, setTelegramStatus] = useState<string>('');

  // Serverdan buyurtmalarni yuklash va jonli sinxronizatsiya
  const fetchServerOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setAllOrders(data.orders);
        localStorage.setItem('xamsiya_orders', JSON.stringify(data.orders));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // LocalStorage va Serverdan ma'lumotlarni yuklash
  useEffect(() => {
    setMounted(true);
    try {
      const savedCart = localStorage.getItem('xamsiya_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedUser = localStorage.getItem('xamsiya_user');
      if (savedUser) {
        const parsedUser: UserProfile = JSON.parse(savedUser);
        setUser(parsedUser);
        setCustomerName(parsedUser.name);
        setCustomerPhone(parsedUser.phone);
        setCustomerAddress(parsedUser.address || '');
      }

      const savedOrders = localStorage.getItem('xamsiya_orders');
      if (savedOrders) setAllOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error(e);
    }

    fetchServerOrders();
    // Har 8 soniyada Telegram botdan kelgan o'zgarishlarni jonli tekshirib turadi
    const interval = setInterval(fetchServerOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  // Savatcha o'zgarganda saqlash
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('xamsiya_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, mounted]);

  // Foydalanuvchining shaxsiy buyurtmalari ro'yxati
  const myOrders = useMemo(() => {
    if (!user) return [];
    const cleanUserPhone = user.phone.replace(/\D/g, '');
    return allOrders.filter((ord) => {
      const cleanOrdPhone = ord.customerPhone.replace(/\D/g, '');
      return cleanOrdPhone === cleanUserPhone || ord.customerName.toLowerCase() === user.name.toLowerCase();
    });
  }, [allOrders, user]);

  // Chegirmali mahsulotlar (Katta chegirmalar)
  const discountedProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const isDiscounted = Boolean(product.oldPrice && product.oldPrice > product.price);
      const matchesQuery =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return isDiscounted && matchesQuery;
    });
  }, [searchQuery]);

  // Top va ommabop mahsulotlar (Eng ko'p sotilganlar)
  const topProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const isTop = Boolean(product.isPopular || product.rating >= 4.9);
      const matchesQuery =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return isTop && matchesQuery;
    });
  }, [searchQuery]);

  // 7 000 ta chexollar mega likvidatsiyasi ro'yxati (Model bo'yicha moslashgan)
  const caseProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (product.category !== 'Chexol') return false;
      if (!selectedModel) return true;
      return (
        product.compatibleModels?.some((m) =>
          m.toLowerCase().includes(selectedModel.toLowerCase())
        ) ?? true
      );
    });
  }, [selectedModel]);

  // Qidiruv natijalari (agar qidiruv yozilsa)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Savat boshqaruvi (Rang va telefon modeli bilan)
  const addToCart = (product: Product, overrideColor?: string, overrideModel?: string) => {
    const chosenColor = overrideColor || selectedColors[product.id] || (product.category === 'Chexol' ? 'Qora (Black)' : undefined);
    const chosenModel = overrideModel || (product.category === 'Chexol' ? (selectedModel || 'iPhone 14 Pro') : undefined);

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.id === product.id && item.selectedColor === chosenColor && item.selectedModel === chosenModel
      );
      if (existingIdx > -1) {
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          selectedColor: chosenColor,
          selectedModel: chosenModel,
        },
      ];
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

  const updateCartItemQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, idx) => {
          if (idx === index) {
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

  const removeCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  // 🔥 2+1 AKSIYA AVTOMATIK HISOB-KITOBI (Har 3 ta chexoldan 1 tasi 100% BEPUL / 0 so'm)
  const caseCartItems = useMemo(() => {
    return cart.filter((item) => item.category === 'Chexol');
  }, [cart]);

  const totalCaseQuantity = useMemo(() => {
    return caseCartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [caseCartItems]);

  const freeCasesCount = Math.floor(totalCaseQuantity / 3);

  const freeCasesDiscount = useMemo(() => {
    if (freeCasesCount <= 0) return 0;
    const individualPrices: number[] = [];
    caseCartItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        individualPrices.push(item.price);
      }
    });
    // Eng arzon chexol narxlarini bepul qilamiz
    individualPrices.sort((a, b) => a - b);
    return individualPrices.slice(0, freeCasesCount).reduce((acc, p) => acc + p, 0);
  }, [caseCartItems, freeCasesCount]);

  const rawCartPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const totalCartPrice = Math.max(0, rawCartPrice - freeCasesDiscount);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ⚡ 1-BOSISHDA TEZKOR XARID OCHISH
  const openQuickBuy = (product: Product) => {
    const chosenColor = selectedColors[product.id] || (product.category === 'Chexol' ? 'Qora (Black)' : '');
    const chosenModel = selectedModel || product.compatibleModels?.[0] || (product.category === 'Chexol' ? 'iPhone 14 Pro' : '');

    setQuickBuyProduct(product);
    setQuickColor(chosenColor);
    setQuickModel(chosenModel);
    if (user) {
      setQuickName(user.name);
      setQuickPhone(user.phone);
      setQuickAddress(user.address || '');
    }
  };

  // ⚡ 1-BOSISHDA TEZKOR BUYURTMA YUBORISH
  const handleQuickBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBuyProduct) return;

    if (!quickName.trim() || !quickPhone.trim()) {
      alert("Iltimos, ismingiz va telefon raqamingizni kiriting!");
      return;
    }

    setIsQuickSubmitting(true);
    const orderId = 'TEZ-' + Math.floor(1000 + Math.random() * 9000);

    const quickItem: CartItem = {
      ...quickBuyProduct,
      quantity: 1,
      selectedColor: quickColor || undefined,
      selectedModel: quickModel || undefined,
    };

    const newOrder: Order = {
      id: orderId,
      customerName: quickName.trim(),
      customerPhone: quickPhone.trim(),
      customerAddress: quickAddress.trim() || "Yakkabog' tumani (Do'kondan olib ketish)",
      comment: orderComment.trim() ? `[TEZKOR XARID] ${orderComment.trim()}` : '[1 BOSISHDA TEZKOR XARID]',
      items: [quickItem],
      totalPrice: quickBuyProduct.price,
      discountApplied: 0,
      status: 'Yangi',
      createdAt: new Date().toLocaleDateString('uz-UZ', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Foydalanuvchi ma'lumotlarini saqlash
    if (!user) {
      const autoUser: UserProfile = {
        name: quickName.trim(),
        phone: quickPhone.trim(),
        address: quickAddress.trim(),
      };
      setUser(autoUser);
      localStorage.setItem('xamsiya_user', JSON.stringify(autoUser));
    }

    // Mahalliy buyurtmalar ro'yxatiga qo'shish
    try {
      const updatedOrders = [newOrder, ...allOrders];
      setAllOrders(updatedOrders);
      localStorage.setItem('xamsiya_orders', JSON.stringify(updatedOrders));
    } catch (err) {
      console.error(err);
    }

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          customerName: quickName.trim(),
          customerPhone: quickPhone.trim(),
          customerAddress: quickAddress.trim() || "Yakkabog' tumani (Do'kondan olib ketish)",
          comment: `⚡ 1-Bosishda Tezkor Xarid${orderComment ? ': ' + orderComment : ''}`,
          items: [
            {
              id: quickBuyProduct.id,
              name: quickBuyProduct.name,
              category: quickBuyProduct.category,
              price: quickBuyProduct.price,
              quantity: 1,
              image: quickBuyProduct.image,
              selectedColor: quickColor || undefined,
              selectedModel: quickModel || undefined,
            },
          ],
          totalPrice: quickBuyProduct.price,
          discountApplied: 0,
        }),
      });

      const data = await response.json();
      setLastOrderId(orderId);
      setCustomerName(quickName);
      setIsQuickSubmitting(false);
      setQuickBuyProduct(null);
      setOrderSuccess(true);

      if (data.telegramSent) {
        setTelegramStatus("Tezkor buyurtma do'kon egasining Telegram botiga yuborildi!");
      } else {
        setTelegramStatus("Tezkor buyurtma qabul qilindi va profilingizga qo‘shildi.");
      }
    } catch (err) {
      console.error(err);
      setIsQuickSubmitting(false);
      setQuickBuyProduct(null);
      setOrderSuccess(true);
      setTelegramStatus("Tezkor buyurtma qabul qilindi.");
    }
  };

  // --- RO'YXATDAN O'TISH / KIRISH ---
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

    // Buyurtma formasiga ham to'ldiramiz
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

  // --- PROFIL MA'LUMOTLARINI TAHRIRLASH VA SAQLASH ---
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

  // --- YANGI SOXTA PROMOKOD QO'SHISH (DEMO) ---
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

  // --- TELEGRAM BOTGA VA BAZAGA BUYURTMA YUBORISH ---
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Iltimos, ismingiz va telefon raqamingizni kiriting!");
      return;
    }

    setIsSubmitting(true);
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || "Ko'rsatilmadi",
      comment: orderComment ? orderComment : undefined,
      items: [...cart],
      totalPrice: totalCartPrice,
      discountApplied: freeCasesDiscount,
      status: 'Yangi',
      createdAt: new Date().toLocaleDateString('uz-UZ', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Agar foydalanuvchi hali kirmagan bo'lsa, avtomatik profil qilib qo'yish
    if (!user) {
      const autoUser: UserProfile = {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim(),
      };
      setUser(autoUser);
      localStorage.setItem('xamsiya_user', JSON.stringify(autoUser));
    }

    // Mahalliy bazaga qo'shish (mijoz o'z profilida ko'rishi uchun)
    try {
      const updatedOrders = [newOrder, ...allOrders];
      setAllOrders(updatedOrders);
      localStorage.setItem('xamsiya_orders', JSON.stringify(updatedOrders));
    } catch (err) {
      console.error(err);
    }

    try {
      // Telegram Bot API ga yuborish
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim() || "Ko'rsatilmadi",
          comment: orderComment || undefined,
          items: cart.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
            selectedColor: i.selectedColor,
            selectedModel: i.selectedModel,
          })),
          totalPrice: totalCartPrice,
          discountApplied: freeCasesDiscount,
        }),
      });

      const data = await response.json();

      setLastOrderId(orderId);
      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setOrderSuccess(true);
      setCart([]);

      if (data.telegramSent) {
        setTelegramStatus("Buyurtma do'kon egasining Telegram botiga yuborildi!");
      } else if (data.isDemo) {
        setTelegramStatus("Buyurtma qabul qilindi va profilingizga qo‘shildi.");
      }
    } catch (err) {
      console.error('Buyurtma yuborishda xatolik:', err);
      setIsSubmitting(false);
      setIsCheckoutOpen(false);
      setOrderSuccess(true);
      setCart([]);
      setTelegramStatus("Buyurtma profilingizda saqlandi.");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <div className="w-5 h-5 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
          <span>Xamsiya Market...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 selection:bg-neutral-950 selection:text-white font-sans antialiased w-full max-w-full overflow-x-clip pb-20 sm:pb-10">
      {/* 7 000 CHEXOLLAR MEGA LIKVIDATSIYASI E'LONI */}
      <div className="bg-neutral-950 text-white text-[11px] sm:text-xs py-2 px-3 text-center font-medium border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
            <Flame className="w-3 h-3 fill-white" />
            7 000+ DANA MEGA SOTUV
          </span>
          <span className="font-semibold text-neutral-200">
            2 ta chexol xarid qiling — 3-chisi yoki 9D shisha SOVG‘A! Yakkabog‘ bo‘ylab yetkazish tekin.
          </span>
          <a href="#mega-chexol" className="underline font-bold text-amber-400 hover:text-amber-300 ml-1 inline-flex items-center gap-0.5">
            Aksiyani ko‘rish <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 1. HEADER (YUQORI QISM) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/70 shadow-xs transition-all w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
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
                Telefon aksessuarlari
              </span>
            </div>
          </a>

          {/* Havolalar */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
            <a href="/" className="text-neutral-950 font-bold">
              Bosh sahifa
            </a>
            <a href="#mega-chexol" className="hover:text-neutral-950 transition-colors flex items-center gap-1 text-rose-600 font-extrabold">
              <Flame className="w-3.5 h-3.5 fill-rose-600" />
              <span>7 000 Chexol Aksiya</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black">
                2+1
              </span>
            </a>
            <a href="/categories" className="hover:text-neutral-950 transition-colors flex items-center gap-1.5">
              <span>Kategoriyalar</span>
              <span className="px-1.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-800">
                6 toifa
              </span>
            </a>
            <a href="#chegirmalar" className="hover:text-neutral-950 transition-colors">
              Chegirmalar
            </a>
            <a href="#top-mahsulotlar" className="hover:text-neutral-950 transition-colors">
              Top tovarlar
            </a>
            <a href="#optom" className="hover:text-neutral-950 transition-colors text-amber-700 font-bold">
              Optom (Do‘konlar)
            </a>
          </nav>

          {/* O'ng tomon: Telefon, Mijoz Kabineti va Savatcha */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a
              href="tel:+998200191809"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full border border-neutral-200/80 hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 text-xs font-semibold transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>+998 (20) 019-18-09</span>
            </a>

            {/* Savatcha tugmasi */}
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

            {/* MIJOZ PROFILI / KIRISH TUGMASI (ENG O'NG BURCHAKDA) */}
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
                title="Mening buyurtmalarim va profilim"
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
                title="Mijoz kabineti"
              >
                <User className="w-4 h-4 text-neutral-600" />
                <span className="hidden sm:inline">Kabinet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (BOSH BANNER VA QIDIRUV) */}
      <section className="relative overflow-hidden pt-6 pb-8 sm:pt-14 sm:pb-18 bg-gradient-to-b from-white via-neutral-50/50 to-[#FAFAFA] w-full px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200/80 text-[11px] sm:text-xs font-medium text-neutral-700 mb-4 max-w-full truncate">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            <span className="truncate">Asl sifatdagi smartfon aksessuarlari</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-950 leading-snug sm:leading-tight mb-3 sm:mb-5 max-w-full">
            Smartfoningiz uchun <br />
            <span className="text-neutral-400 font-light">zamonaviy va mukammal</span> yechimlar
          </h1>

          <p className="text-xs sm:text-base text-neutral-500 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            Chexollar, tezkor GaN zaryadlovchilar, ANC quloqchinlar, pishiq kabellar, 9D oynalar va yuqori sig‘imli powerbanklar.
          </p>

          {/* Tezkor qidiruv satri */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl p-1 shadow-sm border border-neutral-200 focus-within:border-neutral-950 transition-all">
              <div className="pl-3.5 pr-2 text-neutral-400">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Aksessuar nomi yoki turini qidiring (masalan: Chexol, 65W, Oyna)..."
                className="w-full py-2.5 sm:py-3 pr-3 bg-transparent text-xs sm:text-sm outline-none text-neutral-900 placeholder:text-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Ommabop qidiruv teglari */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px] text-neutral-500">
              <span className="font-medium text-neutral-400">Ommabop:</span>
              {['MagSafe', 'GaN 65W', 'AirPods', 'Powerbank', '9D Oyna'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-2.5 py-0.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-400 text-neutral-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QIDIRUV NATIJALARI (AGAR QIDIRUV YOZILSA) */}
      {searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-950">
                Qidiruv natijalari: <span className="text-neutral-500 font-normal">"{searchQuery}"</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">{searchResults.length} ta mahsulot topildi</p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white"
            >
              Qidiruvni tozalash
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-200 p-8">
              <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
              <h3 className="text-sm font-bold text-neutral-800">Hech qanday mahsulot topilmadi</h3>
              <p className="text-xs text-neutral-400 mt-1">So‘rovingizni o‘zgartiring yoki barcha kategoriyalarni ko‘ring.</p>
              <a
                href="/categories"
                className="inline-block mt-4 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800"
              >
                Katalogga o‘tish
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {searchResults.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                const discountPercent = product.oldPrice
                  ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-neutral-200/80 hover:shadow-xl hover:border-neutral-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {discountPercent > 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                        <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[9px]">
                          {product.category}
                        </span>
                        <span className="flex items-center gap-0.5 font-bold text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {product.rating}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 mt-3 flex items-center justify-between">
                      <div>
                        {product.oldPrice && (
                          <span className="block text-[10px] line-through text-neutral-400">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-black text-neutral-950">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      {inCart ? (
                        <div className="flex items-center bg-neutral-100 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-5 h-5 rounded bg-white flex items-center justify-center text-xs font-bold"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{inCart.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-5 h-5 rounded bg-neutral-950 text-white flex items-center justify-center text-xs font-bold"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openQuickBuy(product)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-all active:scale-95 shadow-xs flex items-center gap-1"
                            title="1 bosishda tezkor xarid"
                          >
                            <Zap className="w-3 h-3 fill-white" />
                            <span>Tezkor</span>
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800"
                          >
                            Savatga
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 2.5. 🔥 7 000+ DANA CHEXOLLAR MEGA LIKVIDATSIYASI VA MODEL TANLAGICH */}
      {!searchQuery && (
        <section id="mega-chexol" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 scroll-mt-24">
          {/* Aksiya Bosh Kartochkasi */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-rose-950 text-white p-6 sm:p-10 shadow-2xl border border-neutral-800 mb-8">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Katta Ombor Likvidatsiyasi</span>
                </div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  7 000+ Original Chexollar <br className="hidden sm:block" />
                  <span className="text-rose-500">Mega Sotuvi Boshlandi!</span>
                </h2>
                <p className="text-xs sm:text-base text-neutral-300 mt-3 leading-relaxed">
                  Barcha iPhone, Samsung va Xiaomi smartfonlari uchun sertifikatlangan, sifatli va bardoshli g‘iloflar eng arzon ulgurji narxlarda.
                </p>

                {/* 3 ta Aksiya Ustunlari */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">2+1 AKSIYA</span>
                      <span className="text-[11px] text-neutral-300">2 ta oling, 3-chisi bepul</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">9D SHISHA SOVG‘A</span>
                      <span className="text-[11px] text-neutral-300">Har bir chexolga bepul</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">TEZ VA BEPUL</span>
                      <span className="text-[11px] text-neutral-300">Yakkabog‘ bo‘ylab yetkazish</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* O'ng tomon: Super Promokod kartasi */}
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-center max-w-sm w-full shrink-0 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-rose-400 uppercase block mb-1">
                    Maxsus Aksiya Promokodi
                  </span>
                  <div className="font-mono font-black text-2xl sm:text-3xl text-white tracking-widest bg-black/40 py-2.5 rounded-xl border border-white/10 my-2 shadow-inner">
                    CHEXOL7000
                  </div>
                  <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
                    Savatchada kiriting va qo‘shimcha <strong className="text-white">20% chegirma hamda 9D shisha</strong> sovg‘asini oling!
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('CHEXOL7000');
                    alert("Promokod nusxalandi: CHEXOL7000 ✅");
                  }}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Promokoddan nusxa olish</span>
                </button>
              </div>
            </div>
          </div>

          {/* TELEFON MODELINI TANLASH (SMART MODEL SELECTOR) */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-neutral-200/90 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-xs font-bold text-neutral-800 mb-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-neutral-900" />
                  <span>Tezkor moslashtirish</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-neutral-950">
                  Smartfoningiz modelini tanlang
                </h3>
                <p className="text-xs text-neutral-500">
                  Modelni belgilang — faqat sizning telefoningizga mos 100% tushadigan g‘iloflar ko‘rsatiladi
                </p>
              </div>

              {selectedModel && (
                <button
                  onClick={() => setSelectedModel('')}
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-all flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Filtrni tozalash</span>
                </button>
              )}
            </div>

            {/* Brend tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none border-b border-neutral-100">
              {PHONE_BRANDS.map((brand) => {
                const isActive = selectedBrand === brand.key;
                return (
                  <button
                    key={brand.key}
                    onClick={() => {
                      setSelectedBrand(brand.key);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-neutral-950 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-950'
                    }`}
                  >
                    {brand.name}
                  </button>
                );
              })}
            </div>

            {/* Model chiplari */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedModel('')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  !selectedModel
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:border-neutral-400'
                }`}
              >
                Barchasi ({caseProducts.length} ta chexol)
              </button>

              {PHONE_BRANDS.find((b) => b.key === selectedBrand)?.models.map((model) => {
                const isCurrent = selectedModel === model;
                return (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(isCurrent ? '' : model)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:border-neutral-950 hover:bg-white'
                    }`}
                  >
                    {model}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CHEXOLLAR GRIDI */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {caseProducts.map((product) => {
              const inCart = cart.find((i) => i.id === product.id);
              const discountPercent = product.oldPrice
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className={`group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border transition-all flex flex-col justify-between ${
                    product.isMegaDeal
                      ? 'border-rose-300 ring-2 ring-rose-500/20 shadow-md'
                      : 'border-neutral-200/90 hover:border-neutral-400 shadow-xs hover:shadow-xl'
                  }`}
                >
                  <div>
                    {/* Rasm qismi */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Sovg'a va chegirma teglari */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.giftBadge && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] sm:text-xs font-black shadow-xs">
                            {product.giftBadge}
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-xs text-white text-[10px] font-bold">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/95 text-neutral-900 text-[9px] font-bold shadow-2xs">
                          7 000 zaxirada
                        </span>
                      </div>
                    </div>

                    {/* Reyting */}
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-neutral-800">{product.rating}</span>
                      <span className="text-neutral-400">({product.reviewsCount})</span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 tracking-tight line-clamp-2 mb-1 group-hover:text-rose-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mb-2">
                      {product.description}
                    </p>

                    {/* Rang tanlash swatches */}
                    <div className="mt-2 pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1.5">
                        <span className="font-semibold flex items-center gap-1 text-neutral-700">
                          <Palette className="w-3 h-3 text-neutral-400" />
                          Rang:
                        </span>
                        <span className="text-[10px] font-bold text-neutral-900 truncate max-w-[110px]">
                          {selectedColors[product.id] || 'Qora (Black)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {CASE_COLORS.map((color) => {
                          const isSelected = (selectedColors[product.id] || 'Qora (Black)') === color.name;
                          return (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => setSelectedColors((prev) => ({ ...prev, [product.id]: color.name }))}
                              style={{ backgroundColor: color.hex }}
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-all flex items-center justify-center ${
                                isSelected
                                  ? 'ring-2 ring-neutral-950 ring-offset-1 scale-110 shadow-xs'
                                  : 'border-neutral-300 hover:scale-105'
                              }`}
                              title={color.name}
                            >
                              {isSelected && (
                                <span className={`w-1.5 h-1.5 rounded-full ${color.id === 'clear' ? 'bg-neutral-900' : 'bg-white'}`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Narx va Savatga / Tezkor xarid */}
                  <div className="pt-3 border-t border-neutral-100 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        {product.oldPrice && (
                          <span className="block text-[10px] line-through text-neutral-400">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                        <span className="text-xs sm:text-base font-black text-neutral-950">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                        2+1 Aksiya
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => openQuickBuy(product)}
                        className="w-full flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-all active:scale-95 shadow-xs"
                        title="3 soniyada 1 bosishda buyurtma qilish"
                      >
                        <Zap className="w-3 h-3 fill-white" />
                        <span>Tezkor</span>
                      </button>

                      {inCart ? (
                        <div className="flex items-center justify-between bg-neutral-100 rounded-xl p-0.5 border border-neutral-200">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-5 h-5 rounded-lg bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-xs"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-1 text-center text-xs font-bold text-neutral-900">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-5 h-5 rounded-lg bg-neutral-950 text-white flex items-center justify-center hover:bg-black transition-colors shadow-xs"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="w-full flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] font-bold transition-all active:scale-95 shadow-xs"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Savatga</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DO'KONLAR VA OPTOM (ULGURJI) BLOKI */}
          <div id="optom" className="mt-10 rounded-3xl bg-neutral-900 text-white p-6 sm:p-10 border border-neutral-800 relative overflow-hidden shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
              <div className="max-w-xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold mb-3 border border-amber-500/30">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>B2B / Telefon do‘konlari va ustaxonalar uchun</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
                  10 donadan 1000 donagacha Ulgurji (Optom) Narxlar
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                  Agar sizda telefon do‘koni yoki savdo rastangiz bo‘lsa, 7000 ta chexollarni eng arzon ulgurji narxda sotib oling. Qashqadaryo bo‘ylab tezkor yetkazib berish mavjud!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
                <a
                  href="https://t.me/XamsiyaMarket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegramdan Optom Narxlarni Olish</span>
                </a>
                <a
                  href="tel:+998200191809"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>+998 (20) 019-18-09</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. KATEGORIYALAR VITRINASI (MAXSUS SAHIFA GA HAVOLA) */}
      {!searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-neutral-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                <span>Maxsus toifalar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
                Kategoriyalar Katalogi
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Barcha turdagi telefon aksessuarlarini alohida toifalar bo‘yicha toping
              </p>
            </div>
            <a
              href="/categories"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto shadow-sm"
            >
              <span>Barcha toifalarni ko‘rish</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORY_DETAILS.map((cat) => (
              <a
                key={cat.id}
                href={`/categories?cat=${encodeURIComponent(cat.name)}`}
                className="group bg-white rounded-2xl p-2.5 sm:p-3 border border-neutral-200/80 hover:border-neutral-900 hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-2.5 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[9px] font-bold text-neutral-900 shadow-2xs">
                    {cat.badge}
                  </span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-neutral-900 truncate w-full group-hover:text-neutral-700">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  {cat.itemCount}+ mahsulot
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 4. 🔥 KATTA CHEGIRMALAR (CHEGIRMALI TOVARLAR) */}
      {!searchQuery && (
        <section id="chegirmalar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-neutral-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600 mb-2">
                <Flame className="w-3.5 h-3.5 fill-rose-600" />
                <span>Maxsus Super Takliflar</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 flex items-center gap-2">
                <span>🔥 Katta Chegirmalar</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  Aksiya
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Eng foydali va arzonlashtirilgan narxdagi original aksessuarlar
              </p>
            </div>
            <a
              href="/categories"
              className="text-xs font-bold text-neutral-800 hover:text-neutral-950 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Katalogdagi barcha tovarlar</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {discountedProducts.map((product) => {
              const inCart = cart.find((i) => i.id === product.id);
              const discountPercent = product.oldPrice
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-rose-100 hover:border-rose-300 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Mahsulot rasmi */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] sm:text-xs font-black shadow-xs">
                        -{discountPercent}% CHEGIRMA
                      </span>
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/90 text-neutral-800 text-[9px] font-semibold shadow-2xs">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Baholash */}
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-neutral-800">{product.rating}</span>
                      <span className="text-neutral-400">({product.reviewsCount})</span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 tracking-tight line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="hidden sm:block text-[11px] text-neutral-400 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  </div>

                  {/* Narx va Savatga qo'shish */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      {product.oldPrice && (
                        <span className="block text-[10px] sm:text-xs line-through text-neutral-400">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                      <span className="text-xs sm:text-base font-black text-rose-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {inCart ? (
                      <div className="flex items-center justify-between bg-neutral-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-center text-xs font-bold text-neutral-900">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-neutral-950 text-white flex items-center justify-center hover:bg-black transition-colors shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => openQuickBuy(product)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-all active:scale-95 shadow-xs flex items-center gap-1"
                          title="1 bosishda tezkor xarid"
                        >
                          <Zap className="w-3 h-3 fill-white" />
                          <span>Tezkor</span>
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold transition-all active:scale-95 shadow-xs flex-1 sm:flex-initial"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Savatga</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. ⭐ ENG KO'P XARID QILINGANLAR (TOP MAHSULOTLAR) */}
      {!searchQuery && (
        <section id="top-mahsulotlar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-neutral-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-xs font-bold text-amber-700 mb-2">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Mijozlarimiz tanlovi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
                ⭐ Eng Ko‘p Xarid Qilinganlar (Top)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                Eng yuqori 5.0 yulduzli baho olgan va xaridorlar tomonidan sevilgan xit mahsulotlar
              </p>
            </div>
            <a
              href="/categories"
              className="text-xs font-bold text-neutral-800 hover:text-neutral-950 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Barcha mahsulotlar</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {topProducts.map((product) => {
              const inCart = cart.find((i) => i.id === product.id);

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-neutral-200/80 hover:border-neutral-400 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Mahsulot rasmi */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-neutral-950 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        TOP TANLOV
                      </span>
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-white/90 text-neutral-800 text-[9px] font-semibold shadow-2xs">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Baholash */}
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-neutral-800">{product.rating}</span>
                      <span className="text-neutral-400">({product.reviewsCount})</span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-neutral-900 tracking-tight line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="hidden sm:block text-[11px] text-neutral-400 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  </div>

                  {/* Narx va Savatga qo'shish */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      {product.oldPrice && (
                        <span className="block text-[10px] sm:text-xs line-through text-neutral-400">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                      <span className="text-xs sm:text-base font-black text-neutral-950">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {inCart ? (
                      <div className="flex items-center justify-between bg-neutral-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-center text-xs font-bold text-neutral-900">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-6 h-6 rounded-lg bg-neutral-950 text-white flex items-center justify-center hover:bg-black transition-colors shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => openQuickBuy(product)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition-all active:scale-95 shadow-xs flex items-center gap-1"
                          title="1 bosishda tezkor xarid"
                        >
                          <Zap className="w-3 h-3 fill-white" />
                          <span>Tezkor</span>
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-black text-white text-xs font-bold transition-all active:scale-95 shadow-xs flex-1 sm:flex-initial"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Savatga</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. TO'LIQ KATALOGGA O'TISH BANNERI (CTA) */}
      {!searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-800 text-white p-6 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-neutral-200 mb-3 backdrop-blur-xs">
                To‘liq assortiment
              </span>
              <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                Kerakli aksessuarni topa olmadingizmi?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2">
                Barcha 6 ta toifa, 50+ dan ortiq original tovarlar va maxsus filtrlar bilan to‘liq katalog sahifamizga o‘ting.
              </p>
            </div>
            <a
              href="/categories"
              className="relative z-10 px-6 py-3.5 rounded-2xl bg-white text-neutral-950 hover:bg-neutral-100 font-extrabold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 shrink-0 group"
            >
              <span>Katalog sahifasiga o‘tish</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      )}

      {/* 4. AFZALLIKLARIMIZ */}
      <section id="afzalliklar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-20">
        <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="max-w-xl mx-auto text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950">
              Nega aynan Xamsiya Market?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Mijozlarimizga sifatli servis va ishonchli aksessuarlarni taqdim etamiz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50/70 border border-neutral-100">
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-neutral-950 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-950 text-sm">100% Sifat kafolati</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Barcha tovarlar tekshirilgan va rasmiy standartlarga to‘liq javob beradi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50/70 border border-neutral-100">
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-neutral-950 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-950 text-sm">Tezkor yetkazib berish</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Qashqadaryo viloyati, Yakkabog‘ tumani va butun O‘zbekistonga tezkor yetkazib beriladi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-50/70 border border-neutral-100">
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-neutral-950 shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-950 text-sm">24/7 Qo‘llab-quvvatlash</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Qurilmangiz modeliga mos aksessuarni tanlashda bepul yordam beramiz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SAVATCHA SLIDE-OVER (DRAWER) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full sm:max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-neutral-950" />
                <h3 className="font-extrabold text-base sm:text-lg text-neutral-950">Savatchangiz</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-bold">
                  {totalCartCount} ta
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-800">Savatingiz hozircha bo‘sh</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                    Katalogdan kerakli aksessuarlarni tanlab, savatga qo‘shing.
                  </p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={`${item.id}-${item.selectedColor || ''}-${item.selectedModel || ''}-${index}`}
                    className="flex gap-3 p-2.5 rounded-2xl border border-neutral-100 bg-neutral-50/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-neutral-200 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h5 className="text-xs font-bold text-neutral-900 line-clamp-1">
                            {item.name}
                          </h5>
                          <button
                            onClick={() => removeCartItem(index)}
                            className="text-neutral-400 hover:text-red-500 transition-colors p-0.5"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Model va Rang teglari */}
                        {(item.selectedModel || item.selectedColor) && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {item.selectedModel && (
                              <span className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700 text-[10px] font-semibold">
                                📱 {item.selectedModel}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700 text-[10px] font-semibold">
                                🎨 {item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-200/50">
                        <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartItemQuantity(index, -1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-neutral-100 text-neutral-700 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItemQuantity(index, 1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-neutral-100 text-neutral-700 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-neutral-950">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/90 space-y-3">
                {/* 2+1 Aksiya banneri */}
                {totalCaseQuantity > 0 && (
                  <div
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      freeCasesCount > 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : totalCaseQuantity % 3 === 2
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black mb-1">
                      <Gift className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>2+1 Chexol Mega Aksiyasi ({totalCaseQuantity} ta tanlandi)</span>
                    </div>
                    {freeCasesCount > 0 ? (
                      <p className="text-[11px] font-semibold text-emerald-800 leading-snug">
                        🎉 Aksiya qo‘llandi: <b>{freeCasesCount} ta chexol</b> mutlaqo BEPUL! (-{formatPrice(freeCasesDiscount)})
                      </p>
                    ) : totalCaseQuantity % 3 === 2 ? (
                      <p className="text-[11px] font-semibold text-rose-800 leading-snug">
                        🔥 Yana <b>1 ta chexol</b> qo‘shing — 3-chisi sizga <b>0 so‘mga (BEPUL)</b> beriladi!
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-800 leading-snug">
                        💡 Har 3 ta chexoldan 1 tasi BEPUL yoki 9D shisha sovg‘a qilinadi.
                      </p>
                    )}
                  </div>
                )}

                {/* Narxlar tafsiloti */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span>Mahsulotlar summasi:</span>
                    <span className="font-semibold">{formatPrice(rawCartPrice)}</span>
                  </div>

                  {freeCasesDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold">
                      <span className="flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" /> 2+1 Chexol Chegirmasi:
                      </span>
                      <span>-{formatPrice(freeCasesDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-neutral-500">
                    <span>Yetkazib berish (Yakkabog‘):</span>
                    <span className="text-emerald-600 font-bold">Tekin</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm">
                    <span className="font-bold text-neutral-800">Jami to‘lov:</span>
                    <div className="text-right">
                      {freeCasesDiscount > 0 && (
                        <span className="block text-[11px] line-through text-neutral-400">
                          {formatPrice(rawCartPrice)}
                        </span>
                      )}
                      <span className="text-lg font-black text-neutral-950">
                        {formatPrice(totalCartPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-neutral-950 text-white font-bold text-xs sm:text-sm hover:bg-neutral-800 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Buyurtma berish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. BUYURTMA MODAL FORMASI (TELEGRAM BOT VA PROFILGA BIRIKTIRILGAN) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-neutral-100 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-black text-neutral-950">Buyurtmani rasmiylashtirish</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Buyurtmangiz do‘kon Telegram botiga yuboriladi va profilingizda aks etadi.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-4 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-neutral-600">
                <span>Mahsulotlar soni:</span>
                <span className="font-bold text-neutral-900">{totalCartCount} ta</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>Mahsulotlar summasi:</span>
                <span>{formatPrice(rawCartPrice)}</span>
              </div>
              {freeCasesDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" /> 2+1 Chexol Chegirmasi:
                  </span>
                  <span>-{formatPrice(freeCasesDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-neutral-600">
                <span>Yetkazib berish:</span>
                <span className="text-emerald-600 font-bold">Tekin (Yakkabog‘)</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm">
                <span className="font-bold text-neutral-800">To‘lov summasi:</span>
                <span className="font-black text-neutral-950 text-base">
                  {formatPrice(totalCartPrice)}
                </span>
              </div>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Ismingiz va familiyangiz *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masalan: Sardor Aliyev"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Telefon raqamingiz *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs sm:text-sm font-semibold text-neutral-500">
                    +998
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="90 123 45 67"
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Yetkazib berish manzili
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Yakkabog‘ tumani, ko‘cha va xonadon..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Qo‘shimcha izoh / eslatma (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={orderComment}
                  onChange={(e) => setOrderComment(e.target.value)}
                  placeholder="Masalan: Telefon rangi yoki yetkazish vaqti..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Buyurtma berish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RO'YXATDAN O'TISH / KIRISH MODAL OYNASI */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-2 text-neutral-900">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-950">Mijoz Kabinetiga Kirish</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Buyurtmalaringiz holatini kuzatib borish uchun ma’lumotingizni kiriting
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Ismingiz *
                </label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Masalan: Sardor"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Telefon raqamingiz *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs sm:text-sm font-semibold text-neutral-500">
                    +998
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="90 123 45 67"
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Doimiy yetkazish manzili (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={authAddress}
                  onChange={(e) => setAuthAddress(e.target.value)}
                  placeholder="Yakkabog‘ tumani..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  Kabinetga kirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MIJOZ KABINETI (ICHKI MENYU TIZIMI BILAN) */}
      {isProfileOpen && user && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full sm:max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Kabinet Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
              {profileTab === 'menu' ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-neutral-950 leading-tight">
                      {user.name}
                    </h3>
                    <span className="text-xs text-neutral-500 font-mono">+998 {user.phone}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setProfileTab('menu')}
                  className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-black py-1 px-2 -ml-2 rounded-lg hover:bg-neutral-200/60 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>
                    {profileTab === 'orders' && "Buyurtmalarim"}
                    {profileTab === 'edit-profile' && "Profilni tahrirlash"}
                    {profileTab === 'promocodes' && "Promokodlarim"}
                    {profileTab === 'settings' && "Sozlamalar"}
                  </span>
                </button>
              )}

              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB 1: ASOSIY MENYU (TUSHUNARLI VA CHROYLI TUGMALAR) */}
            {profileTab === 'menu' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-gradient-to-br from-neutral-950 to-neutral-800 text-white rounded-3xl p-5 shadow-sm">
                  <span className="text-xs text-neutral-400 block mb-1">Xush kelibsiz!</span>
                  <h4 className="text-lg font-black tracking-tight">{user.name}</h4>
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-800/80 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Buyurtmalar:</span>
                      <b className="text-white text-sm">{myOrders.length} ta</b>
                    </div>
                    <div className="w-[1px] h-6 bg-neutral-800" />
                    <div>
                      <span className="text-neutral-400 block text-[10px]">Promokodlar:</span>
                      <b className="text-emerald-400 text-sm">{promos.length} ta faol</b>
                    </div>
                  </div>
                </div>

                {/* Asosiy 4 ta menyu bo'limi */}
                <div className="space-y-2.5 pt-1">
                  {/* 1. Buyurtmalarim */}
                  <button
                    onClick={() => setProfileTab('orders')}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-950 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white flex items-center justify-center text-neutral-800 transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs sm:text-sm text-neutral-950">Buyurtmalarim</div>
                        <div className="text-[11px] text-neutral-500">Yetkazib berish holatini jonli kuzating</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {myOrders.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-bold">
                          {myOrders.length}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* 2. Profil ma'lumotlarini tahrirlash */}
                  <button
                    onClick={() => {
                      setEditName(user.name);
                      setEditPhone(user.phone);
                      setEditAddress(user.address || '');
                      setProfileTab('edit-profile');
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-950 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white flex items-center justify-center text-neutral-800 transition-colors">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs sm:text-sm text-neutral-950">Profil ma’lumotlari</div>
                        <div className="text-[11px] text-neutral-500">Ism, telefon va manzilni tahrirlash</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* 3. Promokodlarim */}
                  <button
                    onClick={() => setProfileTab('promocodes')}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-950 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white flex items-center justify-center text-neutral-800 transition-colors">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs sm:text-sm text-neutral-950">Promokodlarim</div>
                        <div className="text-[11px] text-neutral-500">Maxsus chegirmalar va yangi promokod</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {promos.length} ta
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* 4. Sozlamalar */}
                  <button
                    onClick={() => setProfileTab('settings')}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-950 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white flex items-center justify-center text-neutral-800 transition-colors">
                        <SettingsIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs sm:text-sm text-neutral-950">Sozlamalar</div>
                        <div className="text-[11px] text-neutral-500">Til, bildirishnomalar va chiqish</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: BUYURTMALARIM (JONLI KUZATUV BILAN) */}
            {profileTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {myOrders.length === 0 ? (
                  <div className="bg-neutral-50 rounded-2xl p-8 text-center border border-neutral-100 my-6">
                    <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <h5 className="font-bold text-xs text-neutral-800">Sizda hali buyurtmalar yo‘q</h5>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Katalogdan aksessuarlarni tanlab, birinchi buyurtmangizni bering!
                    </p>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-neutral-950 text-white text-xs font-semibold"
                    >
                      Katalogga o‘tish
                    </button>
                  </div>
                ) : (
                  myOrders.map((ord) => {
                    const isNew = ord.status === 'Yangi';
                    const isDelivering = ord.status === 'Yetkazilmoqda';
                    const isCompleted = ord.status === 'Bajarildi';
                    const isCancelled = ord.status === 'Bekor qilindi';

                    return (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2.5">
                          <span className="font-mono font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {ord.id}
                          </span>
                          <span className="text-neutral-400 text-[11px]">{ord.createdAt}</span>
                        </div>

                        {/* Timeline */}
                        <div className="bg-neutral-50 p-3 rounded-xl">
                          <div className="text-[11px] font-bold text-neutral-700 mb-2 flex items-center justify-between">
                            <span>Yetkazib berish holati:</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                isNew
                                  ? 'bg-amber-100 text-amber-800'
                                  : isDelivering
                                  ? 'bg-blue-100 text-blue-800'
                                  : isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-200 text-neutral-700'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>

                          {!isCancelled && (
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center justify-between relative">
                                <div className="absolute left-3 right-3 top-2 h-0.5 bg-neutral-200 -z-0" />
                                <div
                                  className="absolute left-3 top-2 h-0.5 bg-emerald-600 transition-all duration-500 -z-0"
                                  style={{
                                    width: isNew ? '15%' : isDelivering ? '50%' : '90%',
                                  }}
                                />

                                <div className="flex flex-col items-center gap-1 z-10">
                                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                    ✓
                                  </div>
                                  <span className="text-[9px] font-semibold text-neutral-600">Qabul</span>
                                </div>

                                <div className="flex flex-col items-center gap-1 z-10">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                                      isDelivering || isCompleted
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-neutral-200 text-neutral-500'
                                    }`}
                                  >
                                    {isDelivering || isCompleted ? '✓' : '2'}
                                  </div>
                                  <span className="text-[9px] font-semibold text-neutral-600">Yo‘lda</span>
                                </div>

                                <div className="flex flex-col items-center gap-1 z-10">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${
                                      isCompleted
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-neutral-200 text-neutral-500'
                                    }`}
                                  >
                                    {isCompleted ? '✓' : '3'}
                                  </div>
                                  <span className="text-[9px] font-semibold text-neutral-600">Yetkazildi</span>
                                </div>
                              </div>

                              <p className="text-[10px] text-neutral-500 mt-2 text-center">
                                {isNew && "Buyurtmangiz qabul qilindi va qadoqlanmoqda."}
                                {isDelivering && "Mahsulot kuryerga berildi va siz tomon yo‘lda! 🛵"}
                                {isCompleted && "Buyurtma sizga topshirildi. Xaridingiz uchun rahmat! 🎉"}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Mahsulotlar */}
                        <div className="space-y-1.5 pt-1">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-neutral-800 line-clamp-1">
                                {item.name} <b className="text-neutral-400 font-normal">×{item.quantity}</b>
                              </span>
                              <span className="font-semibold shrink-0 ml-2">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-xs">
                          <span className="text-neutral-500">Jami to‘lov:</span>
                          <span className="font-black text-neutral-950 text-sm">
                            {formatPrice(ord.totalPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 3: PROFIL MA'LUMOTLARINI TAHRIRLASH */}
            {profileTab === 'edit-profile' && (
              <div className="flex-1 overflow-y-auto p-4">
                <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs sm:text-sm">
                  {editSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-xs flex items-center gap-2 border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{editSuccessMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Ismingiz va familiyangiz *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Sardor Aliyev"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Telefon raqamingiz *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs sm:text-sm font-semibold text-neutral-500">
                        +998
                      </span>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="90 123 45 67"
                        className="w-full pl-14 pr-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Doimiy yetkazib berish manzili
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Qashqadaryo viloyati, Yakkabog‘ tumani..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                    >
                      Ma’lumotlarni saqlash
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: PROMOKODLARIM (DEMO VA SOXTA QO'SHISH BILAN) */}
            {profileTab === 'promocodes' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Soxta yangi promokod kiritish joyi */}
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80">
                  <div className="text-xs font-bold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Yangi promokodni faollashtirish</span>
                  </div>
                  <form onSubmit={handleAddPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={newPromoInput}
                      onChange={(e) => setNewPromoInput(e.target.value)}
                      placeholder="Kodni kiriting (masalan: XAMSIYA20)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:border-neutral-950 text-xs uppercase font-mono outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs transition-colors shrink-0"
                    >
                      Qo‘shish
                    </button>
                  </form>
                  {promoMessage && (
                    <div className="text-[11px] font-semibold text-emerald-700 mt-2">
                      {promoMessage}
                    </div>
                  )}
                </div>

                {/* Mavjud Promokodlar ro'yxati */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-neutral-700">Mavjud promokodlaringiz ({promos.length}):</div>
                  {promos.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-neutral-950 bg-neutral-100 px-2 py-0.5 rounded-md">
                            {p.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {p.discount}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">{p.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        Faol ✅
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SOZLAMALAR */}
            {profileTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-3">
                  <div className="font-bold text-neutral-900 text-xs">Ilova sozlamalari</div>

                  {/* Bildirishnomalar */}
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <div>
                      <div className="font-semibold text-neutral-800">SMS / Telegram xabarlar</div>
                      <div className="text-[11px] text-neutral-400">Buyurtma holatini xabar qilib turish</div>
                    </div>
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`w-10 h-6 rounded-full transition-colors p-1 flex items-center ${
                        notificationsEnabled ? 'bg-neutral-950 justify-end' : 'bg-neutral-200 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-xs block" />
                    </button>
                  </div>

                  {/* Til */}
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                    <div className="font-semibold text-neutral-800">Tizim tili</div>
                    <select
                      value={appLanguage}
                      onChange={(e) => setAppLanguage(e.target.value)}
                      className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs outline-none cursor-pointer"
                    >
                      <option value="O‘zbekcha (Lotin)">O‘zbekcha (Lotin)</option>
                      <option value="O'zbekcha (Kirill)">Ўзбекча (Кирилл)</option>
                      <option value="Русский">Русский</option>
                    </select>
                  </div>

                  {/* Do'kon filiali */}
                  <div className="py-2">
                    <div className="font-semibold text-neutral-800">Asosiy filial</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      Qashqadaryo viloyati, Yakkabog‘ tumani markazi
                    </div>
                  </div>
                </div>

                {/* Chiqish */}
                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Hisobdan chiqish</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pastki qism: Yordam / Aloqa */}
            <div className="p-3.5 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-600 flex items-center justify-between">
              <span>Yakkabog‘ markazi filiali:</span>
              <a
                href="tel:+998200191809"
                className="font-bold text-neutral-950 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+998 (20) 019-18-09</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 9. BUYURTMA MUVAFFAQIYATLI YAKUNLANDI (KVITANSIYA MODAL) */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-neutral-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-neutral-950">Rahmat! Buyurtmangiz qabul qilindi</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Buyurtma kodi: <b className="text-neutral-900 font-mono">{lastOrderId}</b>
            </p>

            {telegramStatus && (
              <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-600 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{telegramStatus}</span>
              </div>
            )}

            <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
              Hurmatli <span className="font-bold text-neutral-800">{customerName}</span>, buyurtmangiz
              shaxsiy kabinetingizga saqlandi. Uning yetib kelish holatini istalgan payt kuzatishingiz mumkin!
            </p>

            <div className="mt-5 pt-3 border-t border-neutral-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  setIsProfileOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Buyurtma holatini kuzatish</span>
              </button>
              <button
                onClick={() => setOrderSuccess(false)}
                className="w-full py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. FOOTER VA ALOQA */}
      <footer id="aloqa" className="bg-white border-t border-neutral-200/80 pt-12 pb-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border border-neutral-200 bg-white p-1 flex items-center justify-center shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="Xamsiya Market" className="w-full h-full object-contain" />
                </div>
                <span className="font-black text-xl tracking-tight text-neutral-950">
                  Xamsiya <span className="font-light text-neutral-400">Market</span>
                </span>
              </div>
              <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                Zamonaviy telefon aksessuarlari onlayn-do‘koni. Chexollar, zaryadlovchilar, kabellar va himoya oynalari kafolatlangan original sifatda.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-950 mb-3">
                Kategoriyalar
              </h4>
              <ul className="space-y-2 text-xs text-neutral-500">
                {CATEGORIES.slice(1, 7).map((cat) => (
                  <li key={cat}>
                    <a
                      href={`/categories?cat=${encodeURIComponent(cat)}`}
                      className="hover:text-neutral-950 transition-colors"
                    >
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-950 mb-3">
                Aloqa
              </h4>
              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <a href="tel:+998200191809" className="hover:text-neutral-950 font-bold">
                    +998 (20) 019-18-09
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Har kuni: 09:00 - 21:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Qashqadaryo viloyati, Yakkabog‘ tumani</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 text-center sm:text-left">
            <p>© 2025 Xamsiya Market. Barcha huquqlar himoyalangan.</p>
            <p className="text-[11px]">Telegram Bot va Mijoz Kabineti bilan integratsiya qilingan.</p>
          </div>
        </div>
      </footer>

      {/* 10.5. ⚡ 1-BOSISHDA TEZKOR XARID MODAL OYNASI */}
      {quickBuyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-neutral-100 relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setQuickBuyProduct(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal sarlavhasi */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold mb-2">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>1 Bosishda Tezkor Xarid</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-neutral-950">
                Tezkor Buyurtma Berish
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Raqamingizni qoldiring, 3 soniyada do‘kon egasiga buyurtma yetkaziladi!
              </p>
            </div>

            {/* Mahsulot kartochkasi */}
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={quickBuyProduct.image}
                alt={quickBuyProduct.name}
                className="w-16 h-16 rounded-xl object-cover bg-neutral-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {quickBuyProduct.category}
                </span>
                <h4 className="text-xs font-bold text-neutral-900 truncate">
                  {quickBuyProduct.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-black text-neutral-950">
                    {formatPrice(quickBuyProduct.price)}
                  </span>
                  {quickBuyProduct.category === 'Chexol' && (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      + 9D Shisha Sovg‘a
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleQuickBuySubmit} className="space-y-3.5 text-xs sm:text-sm">
              {/* Chexol bo'lsa: Model va Rang tanlash */}
              {quickBuyProduct.category === 'Chexol' && (
                <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 space-y-3">
                  {/* Telefon modeli */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                        Telefon modelingiz:
                      </span>
                      <span className="text-[10px] font-bold text-rose-600">{quickModel || 'Tanlanmadi'}</span>
                    </label>
                    <input
                      type="text"
                      value={quickModel}
                      onChange={(e) => setQuickModel(e.target.value)}
                      placeholder="Masalan: iPhone 14 Pro, Galaxy S23..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-semibold outline-none focus:border-neutral-950"
                    />
                    {/* Tezkor modellar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 scrollbar-none">
                      {['iPhone 15 Pro', 'iPhone 14', 'iPhone 13', 'Galaxy S24', 'Redmi Note 13'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setQuickModel(m)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold shrink-0 border transition-all ${
                            quickModel === m
                              ? 'bg-neutral-950 text-white border-neutral-950'
                              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rang tanlash */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-neutral-500" />
                        Chexol rangi:
                      </span>
                      <span className="text-[10px] font-bold text-neutral-900">{quickColor}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CASE_COLORS.map((color) => {
                        const isSelected = quickColor === color.name;
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setQuickColor(color.name)}
                            className={`p-1.5 rounded-xl border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-white border-neutral-950 ring-2 ring-neutral-950/20 shadow-xs'
                                : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <span
                              style={{ backgroundColor: color.hex }}
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-neutral-300"
                            />
                            <span className="truncate">{color.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Ism */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Ismingiz *
                </label>
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Ismingizni kiriting"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm transition-all"
                />
              </div>

              {/* Telefon */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Telefon raqamingiz *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs sm:text-sm font-semibold text-neutral-500">
                    +998
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="90 123 45 67"
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm font-mono transition-all"
                  />
                </div>
              </div>

              {/* Manzil */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Yetkazib berish manzili
                </label>
                <input
                  type="text"
                  value={quickAddress}
                  onChange={(e) => setQuickAddress(e.target.value)}
                  placeholder="Yakkabog‘ tumani, ko‘cha yoki do‘kondan olib ketish"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 outline-none text-xs sm:text-sm transition-all"
                />
              </div>

              {/* Afzalliklar / Ishonch belgilari */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Yakkabog‘ bo‘ylab yetkazib berish <b>bepul</b></span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>To‘lov faqat mahsulotni ko‘rib olgandan so‘ng!</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isQuickSubmitting}
                  className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
                >
                  {isQuickSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Buyurtma qabul qilinmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Buyurtmani Tasdiqlash (3 soniyada)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. MOBIL TELEFONLAR UCHUN SUZUVCHI PASTKI MENYU (BOTTOM NAV BAR) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-neutral-200/90 sm:hidden py-2 px-6 flex items-center justify-around shadow-lg">
        <a
          href="/"
          className="flex flex-col items-center gap-1 text-neutral-900"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Asosiy</span>
        </a>

        <a
          href="/categories"
          className="flex flex-col items-center gap-1 text-neutral-500 hover:text-neutral-900"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Katalog</span>
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
