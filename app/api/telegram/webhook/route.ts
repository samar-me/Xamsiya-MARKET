import { NextResponse } from 'next/server';
import { getOrders, updateOrderStatus, getOrderById } from '../../../../lib/orders-db';

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ ok: true, message: 'No bot token' });
    }

    // 1. TUGMA BOSILGANDA (CALLBACK QUERY)
    if (update.callback_query) {
      const { id: queryId, data, message, from } = update.callback_query;

      if (data && data.startsWith('status:')) {
        const [, orderId, newStatus] = data.split(':');

        const updatedOrder = await updateOrderStatus(orderId, newStatus as any);

        // Telegramga javob berish (popup bildirishnoma)
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: queryId,
            text: `✅ #${orderId} holati "${newStatus}" ga o‘zgartirildi!`,
            show_alert: false
          })
        });

        // Telegram xabarini tahrirlash (yangi status bilan)
        if (message && updatedOrder) {
          const escapeHtml = (str?: string): string => {
            if (!str) return '';
            return String(str)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
          };

          const statusIcon =
            newStatus === 'Yetkazilmoqda'
              ? '🚚 Yetkazilmoqda (Kuryerda)'
              : newStatus === 'Bajarildi'
              ? '🎉 Bajarildi (Mijoz oldi)'
              : newStatus === 'Bekor qilindi'
              ? '❌ Bekor qilindi'
              : '🟡 Yangi';

          let updatedText = message.text || '';
          // Agar xabarda status bo'lsa yangilaymiz
          if (updatedText.includes('📌 Status:')) {
            updatedText = escapeHtml(updatedText).replace(/📌 Status: .*/, `📌 Status: <b>${statusIcon}</b>`);
          } else {
            updatedText = escapeHtml(updatedText) + `\n\n📌 Status: <b>${statusIcon}</b> (O‘zgartirdi: ${escapeHtml(from?.first_name || 'Admin')})`;
          }

          // Yangi tugmalar
          const newKeyboard = {
            inline_keyboard: [
              [
                {
                  text: newStatus === 'Yetkazilmoqda' ? '🚚 Yetkazilmoqda ✅' : '🚚 Yetkazilmoqda',
                  callback_data: `status:${orderId}:Yetkazilmoqda`
                },
                {
                  text: newStatus === 'Bajarildi' ? '🎉 Bajarildi ✅' : '🎉 Bajarildi',
                  callback_data: `status:${orderId}:Bajarildi`
                }
              ],
              [
                {
                  text: newStatus === 'Bekor qilindi' ? '❌ Bekor qilindi 🛑' : '❌ Bekor qilish',
                  callback_data: `status:${orderId}:Bekor qilindi`
                }
              ]
            ]
          };

          try {
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: message.chat.id,
                message_id: message.message_id,
                text: updatedText,
                parse_mode: 'HTML',
                reply_markup: newKeyboard
              })
            });
          } catch (editErr) {
            console.error('editMessageText error:', editErr);
          }
        }
      }

      return NextResponse.json({ ok: true });
    }

    // 2. BUYRUQLAR: /start, /orders, /stats
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      if (text === '/start') {
        const welcomeText = `
👋 <b>Assalomu alaykum, Xamsiya Market administratori!</b>

Bu bot orqali siz:
📦 Yangi buyurtmalarni qabul qilasiz;
🚚 Buyurtmalarni "Yetkazilmoqda" yoki "Bajarildi" holatiga o‘tkaza olasiz;
📊 Do‘kon statistikasini kuzatasiz.

<b>Buyruqlar:</b>
/orders - Oxirgi buyurtmalar ro‘yxati
/stats - Bugungi savdo statistikasi
`.trim();

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'HTML'
          })
        });
      } else if (text === '/stats') {
        const orders = await getOrders();
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        const completedCount = orders.filter((o) => o.status === 'Bajarildi').length;
        const deliveringCount = orders.filter((o) => o.status === 'Yetkazilmoqda').length;
        const newCount = orders.filter((o) => o.status === 'Yangi').length;

        const statsText = `
📊 <b>XAMSIYA MARKET STATISTIKASI:</b>
━━━━━━━━━━━━━━━━━━━━━
📦 Jami buyurtmalar: <b>${orders.length} ta</b>
🟡 Yangi: <b>${newCount} ta</b>
🚚 Yetkazilmoqda: <b>${deliveringCount} ta</b>
🎉 Bajarildi: <b>${completedCount} ta</b>
━━━━━━━━━━━━━━━━━━━━━
💰 Jami savdo aylanmasi: <b>${totalRevenue.toLocaleString()} so‘m</b>
━━━━━━━━━━━━━━━━━━━━━
        `.trim();

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: statsText,
            parse_mode: 'HTML'
          })
        });
      } else if (text === '/orders') {
        const orders = await getOrders();
        const recent = orders.slice(0, 5);

        if (recent.length === 0) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '📭 Hozircha yangi buyurtmalar yo‘q.'
            })
          });
        } else {
          const listText = recent
            .map(
              (o, i) =>
                `${i + 1}. <b>#${o.id}</b> - ${o.customerName}\n   Holati: <b>${o.status}</b> | Summa: ${o.totalPrice.toLocaleString()} so‘m`
            )
            .join('\n\n');

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `📋 <b>Oxirgi buyurtmalar:</b>\n\n${listText}`,
              parse_mode: 'HTML'
            })
          });
        }
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
