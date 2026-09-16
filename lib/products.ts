export interface CaseColor {
  id: string;
  name: string;
  hex: string;
  border?: boolean;
}

export const CASE_COLORS: CaseColor[] = [
  { id: 'black', name: 'Qora (Black)', hex: '#1C1C1E' },
  { id: 'clear', name: 'Shaffof (Clear)', hex: '#E5E5EA', border: true },
  { id: 'titan', name: 'Titan Grey', hex: '#8E8E93' },
  { id: 'navy', name: 'To‘q Ko‘k (Navy)', hex: '#1E3A8A' },
  { id: 'alpine', name: 'Alpine Yashil', hex: '#2E4C38' },
  { id: 'purple', name: 'Binafsharang', hex: '#581C87' }
];

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  isMegaDeal?: boolean;
  giftBadge?: string;
  colors?: CaseColor[];
  compatibleModels?: string[];
  description: string;
}

export interface CategoryDetail {
  id: string;
  name: string;
  title: string;
  shortDesc: string;
  image: string;
  badge: string;
  itemCount: number;
}

export const CATEGORIES = [
  'Barchasi',
  'Chexol',
  'Zaryadlovchi',
  'Quloqchin',
  'Kabel',
  'Himoya',
  'Powerbank'
];

export const CATEGORY_DETAILS: CategoryDetail[] = [
  {
    id: 'chexol',
    name: 'Chexol',
    title: "Chexollar va G'iloflar",
    shortDesc: "iPhone va Android smartfonlari uchun MagSafe, silikon va zarbaga chidamli 7 000+ original g'iloflar.",
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=700&q=80',
    badge: '7 000+ Omborda',
    itemCount: 7000
  },
  {
    id: 'zaryadlovchi',
    name: 'Zaryadlovchi',
    title: 'Zaryadlovchi Adapterlar',
    shortDesc: "GaN texnologiyali 20W dan 100W gacha bo'lgan tezkor va xavfsiz quvvatlagichlar.",
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80',
    badge: 'GaN Tezkor',
    itemCount: 16
  },
  {
    id: 'quloqchin',
    name: 'Quloqchin',
    title: 'Quloqchinlar va Audio',
    shortDesc: "Aktiv shovqinni bosuvchi (ANC) simsiz AirPods va tiniq bass ovozli quloqchinlar.",
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&q=80',
    badge: 'ANC Premium',
    itemCount: 12
  },
  {
    id: 'kabel',
    name: 'Kabel',
    title: 'Tezkor Quvvatlash Kabellari',
    shortDesc: "Type-C to Lightning va 100W PD to'qilgan mustahkam, sinmaydigan kabellar.",
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
    badge: '100W PD',
    itemCount: 18
  },
  {
    id: 'himoya',
    name: 'Himoya',
    title: 'Himoya Oynalari va Shisha',
    shortDesc: "9D to'liq yelimli, maxfiy Anti-Spy va barmoq izi qolmaydigan mustahkam oynalar.",
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=80',
    badge: '9D Full Glue',
    itemCount: 30
  },
  {
    id: 'powerbank',
    name: 'Powerbank',
    title: 'Powerbank va Tashqi Batareyalar',
    shortDesc: "MagSafe simsiz va 20000mAh noutbuk va smartfonlar uchun yuqori quvvatli akkumulyatorlar.",
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=700&q=80',
    badge: '20000mAh',
    itemCount: 10
  }
];

export const PHONE_BRANDS = [
  {
    name: 'Apple iPhone',
    key: 'apple',
    models: [
      'iPhone 16 Pro Max',
      'iPhone 16 Pro',
      'iPhone 16',
      'iPhone 15 Pro Max',
      'iPhone 15 Pro',
      'iPhone 15',
      'iPhone 14 Pro Max',
      'iPhone 14 Pro',
      'iPhone 13 Pro Max',
      'iPhone 13',
      'iPhone 11 / 12'
    ]
  },
  {
    name: 'Samsung Galaxy',
    key: 'samsung',
    models: [
      'Galaxy S24 Ultra',
      'Galaxy S24 / S24+',
      'Galaxy S23 Ultra',
      'Galaxy A55 5G',
      'Galaxy A54 5G',
      'Galaxy A35 5G',
      'Galaxy A15'
    ]
  },
  {
    name: 'Xiaomi / Redmi',
    key: 'xiaomi',
    models: [
      'Redmi Note 13 Pro',
      'Redmi Note 13',
      'Redmi Note 12 Pro',
      'Poco X6 Pro',
      'Redmi 13C / 12'
    ]
  }
];

export const PRODUCTS: Product[] = [
  // --- CHEXOLLAR (7 000 TA MEGA SOTUV) ---
  {
    id: 1,
    name: 'iPhone 15/16 Pro Max Silikon MagSafe Chexol',
    category: 'Chexol',
    price: 89000,
    oldPrice: 150000,
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 124,
    isPopular: true,
    giftBadge: '🎁 9D Oyna Sovg‘a',
    compatibleModels: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 15 Pro Max', 'iPhone 15 Pro'],
    description: "Yumshoq mikrofibra qoplamali va kuchli MagSafe magnitli original silikon g'ilof. Har bir xaridga 9D shisha sovg'a!"
  },
  {
    id: 201,
    name: 'MEGA TO‘PLAM: 3 ta Chexol (Hafta Ranglari) + 9D Oyna Bepul',
    category: 'Chexol',
    price: 159000,
    oldPrice: 280000,
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviewsCount: 89,
    isPopular: true,
    isMegaDeal: true,
    giftBadge: '🔥 2+1 SOVG‘A',
    compatibleModels: [
      'iPhone 16 Pro Max',
      'iPhone 15 Pro Max',
      'iPhone 14 Pro Max',
      'iPhone 13',
      'Galaxy S24 Ultra',
      'Galaxy A55 5G',
      'Redmi Note 13 Pro'
    ],
    description: "Eng foydali kombo: 3 dona xilma-xil rangdagi original chexol va qo‘shimcha 9D zarbaga chidamli shisha mutlaqo bepul!"
  },
  {
    id: 202,
    name: 'iPhone 13/14/15/16 Shaffof Ultra-Slim Sariq Bo‘lmaydigan Chexol',
    category: 'Chexol',
    price: 65000,
    oldPrice: 110000,
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 78,
    isPopular: true,
    giftBadge: '🎁 2-tasi 100 000 so‘m',
    compatibleModels: ['iPhone 16', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 13', 'iPhone 11 / 12'],
    description: "Smartfoningiz asl rangini yashirmaydigan, burchaklari havo yostiqchalari bilan himoyalangan maxsus shaffof chexol."
  },
  {
    id: 203,
    name: 'Samsung Galaxy S24/S23 Ultra Zarbaga Chidamli Armor Chexol',
    category: 'Chexol',
    price: 85000,
    oldPrice: 135000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 65,
    isPopular: true,
    giftBadge: '🛡️ Armor Zarbakor',
    compatibleModels: ['Galaxy S24 Ultra', 'Galaxy S23 Ultra', 'Galaxy S24 / S24+'],
    description: "Kamera slayd-qopqog'i va yig'iluvchi metall stend (podstavka) bilan jihozlangan 360 darajali himoya g'ilofi."
  },
  {
    id: 204,
    name: 'Samsung Galaxy A55/A54/A35 Matoviy Velvet Silikon Chexol',
    category: 'Chexol',
    price: 55000,
    oldPrice: 90000,
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 54,
    giftBadge: '🎁 Sovg‘ali aksiya',
    compatibleModels: ['Galaxy A55 5G', 'Galaxy A54 5G', 'Galaxy A35 5G', 'Galaxy A15'],
    description: "Qo'ldan sirpanmaydigan, barmoq izi qolmaydigan yumshoq velvet qoplamali matoviy chexol."
  },
  {
    id: 205,
    name: 'Redmi Note 13 Pro / 12 Pro Kamera Himoyali Silikon Chexol',
    category: 'Chexol',
    price: 55000,
    oldPrice: 85000,
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 47,
    giftBadge: '🔥 2+1 Aksiya',
    compatibleModels: ['Redmi Note 13 Pro', 'Redmi Note 13', 'Redmi Note 12 Pro', 'Poco X6 Pro', 'Redmi 13C / 12'],
    description: "Kamera linzalarini to'liq himoya qiluvchi, mustahkam burchakli va elastik yuqori sifatli chexol."
  },
  {
    id: 206,
    name: 'iPhone 14/15/16 Premium Charm (Leather) MagSafe Chexol',
    category: 'Chexol',
    price: 119000,
    oldPrice: 175000,
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 82,
    isPopular: true,
    giftBadge: '✨ Premium Charm',
    compatibleModels: ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 15 Pro Max', 'iPhone 14 Pro Max'],
    description: "Tabiiy teri to'qimali, metall tugmali va kuchli MagSafe magnitli biznes-klass g'ilof."
  },

  // --- BOSHQA AKSESSUARLAR ---
  {
    id: 2,
    name: 'GaN 65W Tezkor Quvvatlash Adaptori (Type-C + USB)',
    category: 'Zaryadlovchi',
    price: 240000,
    oldPrice: 290000,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    rating: 5.0,
    reviewsCount: 72,
    isNew: true,
    isPopular: true,
    description: "Kichik o'lchamli, qizib ketmaydigan va bir vaqtda 3 ta qurilmani tez quvvatlovchi GaN texnologiyasi."
  },
  {
    id: 3,
    name: 'AirPods Pro 2 ANC Shovqinni Bosuvchi Quloqchin',
    category: 'Quloqchin',
    price: 390000,
    oldPrice: 460000,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 110,
    isPopular: true,
    description: "Aktiv shovqin kamaytirish (ANC), shaffoflik rejimi va tiniq bass ovoz."
  },
  {
    id: 4,
    name: 'Baseus 20000mAh 65W Noutbuk va Telefon Powerbank',
    category: 'Powerbank',
    price: 380000,
    oldPrice: 440000,
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 56,
    isPopular: true,
    description: "Katta sig'im, raqamli LED displey va smartfon hamda noutbuklarni quvvatlash imkoniyati."
  },
  {
    id: 5,
    name: "Type-C to Lightning 20W To'qilgan Bardoshli Kabel",
    category: 'Kabel',
    price: 65000,
    oldPrice: 85000,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 63,
    description: "Neylon qoplamali, bukilishlarga o'ta chidamli tezkor quvvatlash va ma'lumot uzatish kabeli."
  },
  {
    id: 6,
    name: '9D Full Glue Max Shisha Himoya Oynasi',
    category: 'Himoya',
    price: 45000,
    oldPrice: 60000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 95,
    isPopular: true,
    description: "Oleo-fobik qoplamali, barmoq izi qolmaydigan, zarbalarga chidamli 9D sifatli shisha."
  },
  {
    id: 7,
    name: 'MagSafe 15W Avtomobil Telefon Tutqichi (Holder)',
    category: 'Chexol',
    price: 185000,
    oldPrice: 220000,
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewsCount: 34,
    isNew: true,
    description: "Mashina deflektoriga qulay mahkamlanadi, kuchli magnit va simsiz tezkor quvvatlaydi."
  },
  {
    id: 8,
    name: '100W 5A Type-C to Type-C Kabel (2 metr)',
    category: 'Kabel',
    price: 85000,
    oldPrice: 110000,
    image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 41,
    isPopular: true,
    description: "Smartfonlar, planshetlar va MacBook uchun 100W PD quvvatlovchi yuqori sifatli kabel."
  },
  {
    id: 9,
    name: 'Magnitli Mini Wireless 10000mAh Powerbank',
    category: 'Powerbank',
    price: 260000,
    oldPrice: 310000,
    image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 28,
    isNew: true,
    description: "Telefon orqasiga yopishib turuvchi ixcham MagSafe simsiz tashqi akkumulyator."
  },
  {
    id: 10,
    name: 'Hoco C76 Plus 20W PD Type-C Tezkor Quvvatlagich',
    category: 'Zaryadlovchi',
    price: 95000,
    oldPrice: 130000,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 88,
    description: "iPhone 12/13/14/15/16 seriyalari uchun 20W PD tezkor original adaptor."
  },
  {
    id: 11,
    name: 'Anti-Spy Maxfiy Shisha Himoya Oynasi (Maxsus himoya)',
    category: 'Himoya',
    price: 65000,
    oldPrice: 85000,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 52,
    isPopular: true,
    description: "Yon tomondan qaraydiganlarga ekranni qora qilib ko'rsatuvchi maxfiy himoya oynasi."
  },
  {
    id: 12,
    name: 'Lenovo LP40 Pro TWS Simsiz Quloqchin',
    category: 'Quloqchin',
    price: 135000,
    oldPrice: 175000,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 67,
    description: "Ixcham zaryad keysi, Bluetooth 5.1 va tiniq stereofonik ovoz."
  }
];

export const formatPrice = (price: number): string => {
  if (!price && price !== 0) return "0 so'm";
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};
