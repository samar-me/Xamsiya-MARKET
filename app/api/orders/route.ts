import { NextResponse } from 'next/server';
import { getOrders, updateOrderStatus } from '../../../lib/orders-db';

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
