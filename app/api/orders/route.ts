import { NextResponse } from 'next/server';
import { getOrders, updateOrderStatus, deleteOrder } from '../../../lib/orders-db';

// Barcha buyurtmalarni olish
export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

// Buyurtma holatini yangilash (Admin yoki boshqaruv uchun)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'ID va status talab qilinadi' },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Buyurtma topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

// Buyurtmani o'chirish
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Buyurtma ID si talab qilinadi' },
        { status: 400 }
      );
    }

    const deleted = await deleteOrder(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

// Telegram botga test yoki xabar yuborish
export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8870844089:AAHNrSgJGo8nMxGRdLtNo2tUvPFXlHNXn6U';
    const chatId = process.env.TELEGRAM_CHAT_ID || '7833585964';

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message || '🔔 Xamsiya MARKET: Admin paneldan sinov signali!',
        parse_mode: 'HTML'
      })
    });

    const data = await tgRes.json();
    return NextResponse.json({ success: data.ok, result: data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Telegramga yuborishda xatolik' },
      { status: 500 }
    );
  }
}

