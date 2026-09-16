import { NextResponse } from 'next/server';
import { saveOrder, Order } from '../../../lib/orders-db';

interface OrderItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedModel?: string;
}

interface OrderRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  comment?: string;
  items: OrderItem[];
  totalPrice: number;
  discountApplied?: number;
}

export async function POST(req: Request) {
  try {
    const body: OrderRequest = await req.json();

    const {
      id,
      customerName,
      customerPhone,
      customerAddress,
      comment,
      items,
      totalPrice,
      discountApplied
    } = body;

    // Tekshiruv
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar to'liq emas" },
        { status: 400 }
      );
    }

    // Narxni chiroyli formatlash
    // Xavfsiz HTML formatlash (Telegram API <, >, & belgilarida 400 bermasligi uchun)
    const escapeHtml = (str?: string): string => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    const formatPrice = (price: number) => {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
    };

    // Server bazasiga buyurtmani saqlash
    const newOrder: Order = {
      id,
      customerName,
      customerPhone,
      customerAddress: customerAddress || "Yakkabog' tumani (Do'kondan olib ketish)",
      comment,
      items,
      totalPrice,
      discountApplied,
      status: 'Yangi',
      createdAt: new Date().toISOString()
    };

    // Telegram Bot sozlamalari (.env.local orqali)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Telegram uchun mahsulotlar ro'yxati (Rang va Model ko'rsatilgan holda)
    const itemsListText = items
      .map((item, index) => {
        let details = '';
        if (item.selectedModel) details += `\n     📱 Model: <b>${escapeHtml(item.selectedModel)}</b>`;
        if (item.selectedColor) details += `\n     🎨 Rang: <b>${escapeHtml(item.selectedColor)}</b>`;
        return `  ${index + 1}. <b>${escapeHtml(item.name)}</b>${details}\n     └ ${item.quantity} dona × ${formatPrice(item.price)} = <b>${formatPrice(item.price * item.quantity)}</b>`;
      })
      .join('\n\n');

    const cleanPhone = customerPhone.replace(/\D/g, '');
    const phoneDisplay = cleanPhone.startsWith('998') ? `+${cleanPhone}` : `+998 ${cleanPhone}`;

    const discountText = discountApplied && discountApplied > 0
      ? `\n🎁 <b>Qo‘llanilgan chegirma:</b> -${formatPrice(discountApplied)} (2+1 Aksiya / Promokod)`
      : '';

    const messageText = `
🛍 <b>YANGI BUYURTMA: #${escapeHtml(id)}</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Mijoz:</b> ${escapeHtml(customerName)}
📞 <b>Telefon:</b> <a href="tel:${phoneDisplay}">${phoneDisplay}</a>
📍 <b>Manzil:</b> ${escapeHtml(newOrder.customerAddress)}
${comment ? `💬 <b>Izoh:</b> ${escapeHtml(comment)}\n` : ''}
📦 <b>Buyurtma tarkibi:</b>
${itemsListText}
${discountText}
━━━━━━━━━━━━━━━━━━━━━
💰 <b>JAMI TO'LOV:</b> <u>${formatPrice(totalPrice)}</u>
⏰ <b>Vaqti:</b> ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}
📌 <b>Status:</b> 🟡 <b>Yangi (Kutilmoqda)</b>
━━━━━━━━━━━━━━━━━━━━━
<i>Boshqaruv tugmalari orqali buyurtma statusini o‘zgartiring:</i>
`.trim();

    // Inline boshqaruv tugmalari
    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '🚚 Yetkazilmoqda',
            callback_data: `status:${id}:Yetkazilmoqda`
          },
          {
            text: '🎉 Bajarildi',
            callback_data: `status:${id}:Bajarildi`
          }
        ],
        [
          {
            text: '❌ Bekor qilish',
            callback_data: `status:${id}:Bekor qilindi`
          },
          {
            text: '📞 Qo‘ng‘iroq',
            url: `tel:${phoneDisplay}`
          }
        ]
      ]
    };

    let telegramSent = false;
    let telegramMessageId: number | undefined;

    if (botToken && chatId && botToken !== 'YOUR_BOT_TOKEN_HERE') {
      try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
          }),
        });

        const data = await response.json();
        if (data.ok) {
          telegramSent = true;
          telegramMessageId = data.result.message_id;
          newOrder.telegramMessageId = telegramMessageId;
        } else {
          console.error('Telegram API xatosi:', data);
        }
      } catch (tgErr) {
        console.error('Telegram fetch error:', tgErr);
      }
    }

    // Bazaga saqlaymiz
    await saveOrder(newOrder);

    return NextResponse.json({
      success: true,
      telegramSent,
      order: newOrder,
      message: telegramSent
        ? 'Buyurtma qabul qilindi va Telegram botga boshqaruv tugmalari bilan yuborildi'
        : 'Buyurtma qabul qilindi (bazada saqlandi)'
    });
  } catch (error: any) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
