# 🛍️ Xamsiya Market — Telefon Aksessuarlari Onlayn Do‘koni

**Xamsiya Market** — zamonaviy smartfon aksessuarlari, original chexollar, tezkor zaryadlovchilar va himoya oynalarini sotishga mo‘ljallangan yuqori konversiyali, tezkor va interaktiv onlayn-do‘kon platformasi.

---

## 🌟 Asosiy Imkoniyatlar va Funksiyalar

### 1. 🔥 7 000+ Chexollar Mega Likvidatsiyasi
- **Smartfon tanlagich:** Apple, Samsung va Xiaomi modellarini tanlash orqali faqat mos keladigan g‘iloflarni ko‘rsatish.
- **2+1 Avtomatik Aksiya:** Savatchaga qo‘shilgan har 3 ta chexoldan 1 tasi mutlaqo **0 so‘m (100% BEPUL)** qilib avtomatik chegiriladi.
- **B2B Ulgurji savdo (Optom):** Telefon do‘konlari va ustalari uchun 10 tadan 1 000 tagacha ulgurji buyurtma berish bo‘limi.
- **Maxsus promokod:** `CHEXOL7000` (nusxa olish tugmasi bilan).

### 2. 🎨 Rang Tanlash Variatsiyalari (Color Swatches)
- Chexollarda 6 ta zamonaviy rang varianti (Qora, Shaffof, Titan Grey, To‘q Ko‘k, Alpine Yashil, Binafsharang).
- Tanlangan rang savatchada va Telegram botga yuboriladigan buyurtma matnida aniq aks etadi.

### 3. ⚡ 1 Bosishda Tezkor Xarid (One-Click Buy)
- Har bir mahsulotda alohida sariq **"⚡ Tezkor"** tugmasi.
- 3 soniyada faqat ism va telefon raqam kiritib, to‘g‘ridan-to‘g‘ri buyurtma rasmiylashtirish imkoniyati.

### 4. 🤖 Ikki Tomonlama Telegram Bot Nazorati
- Yangi buyurtma tushishi bilan do‘kon egasining Telegram botiga barcha ma’lumotlar boradi.
- Xabar tagida interaktiv boshqaruv tugmalari chiqadi:
  - `[ 🚚 Yetkazilmoqda ]`
  - `[ 🎉 Bajarildi ]`
  - `[ ❌ Bekor qilish ]`
  - `[ 📞 Qo‘ng‘iroq qilish ]`
- Tugma bosilishi bilan serverdagi buyurtma holati yangilanadi va xaridor kabinetida jonli ko‘rinadi.

### 5. 👤 Mijoz Shaxsiy Kabineti
- Buyurtmalar tarixi va yetkazib berish holatini jonli kuzatish (Qabul qilindi ➔ Yo‘lda ➔ Yetkazildi).
- Profil ma’lumotlarini tahrirlash (ism, telefon, doimiy manzil).
- Promokodlar boshqaruvi.

---

## 🛠️ Texnologiyalar

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Kutubxona:** React 18 & TypeScript
- **Styling:** Tailwind CSS
- **Belgilar (Icons):** Lucide React
- **Bot API:** Telegram Bot API (Webhooks & Inline Keyboards)

---

## 🚀 O‘rnatish va Ishga Tushirish

### 1. Repozitoriyni klonlash:
```bash
git clone https://github.com/USERNAME/xamsiya-market.git
cd xamsiya-market
```

### 2. Bog‘liqliklarni o‘rnatish:
```bash
npm install
```

### 3. Muhit o‘zgaruvchilarini sozlash (`.env.local`):
`.env.example` faylidan nusxa olib, `.env.local` yarating:
```bash
cp .env.example .env.local
```

Fayl ichiga Telegram bot ma’lumotlaringizni kiriting:
```env
TELEGRAM_BOT_TOKEN=8870844089:AAHNrSgJGo8nMxGRdLtNo2tUvPFXlHNXn6U
TELEGRAM_CHAT_ID=7833585964
```

### 4. Loyihani ishga tushirish (Development rejimida):
```bash
npm run dev
```
Brauzerda oching: [http://localhost:3000](http://localhost:3000)

### 5. Production uchun yig‘ish (Build):
```bash
npm run build
npm start
```

---

## 🔗 Telegram Webhookni Faollashtirish

Loyihani Vercel yoki o‘z serveringizga joylaganingizdan so‘ng, Telegram botning inline tugmalari ishlashi uchun brauzer orqali quyidagi havolani oching:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<SIZNING_DOMEN>/api/telegram/webhook
```

---

## 📄 Litsenziya
© 2025 Xamsiya Market. Barcha huquqlar himoyalangan.
