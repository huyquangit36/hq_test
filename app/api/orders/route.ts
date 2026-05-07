import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { user_id, total_amount, shipping_address, items } = await req.json();

    // Kiểm tra đầu vào
    if (!user_id || !total_amount || !items || items.length === 0) {
      return NextResponse.json({ error: "Thiếu thông tin đơn hàng hoặc sản phẩm" }, { status: 400 });
    }

    // 1. Chèn đơn hàng vào bảng orders và lấy ID (Dùng RETURNING id)
    const orderResult = await query(
      "INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES ($1, $2, $3, $4) RETURNING id",
      [user_id, total_amount, 'Pending', shipping_address]
    );

    const orderId = orderResult.rows[0].id;

    // 2. Chèn từng sản phẩm vào bảng order_items
    // Chúng ta lặp qua mảng items nhận được từ frontend
    for (const item of items) {
      await query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    return NextResponse.json({ message: "Order success", orderId }, { status: 201 });
  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}