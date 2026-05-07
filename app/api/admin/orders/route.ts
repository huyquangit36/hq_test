import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // THUẬT TOÁN: JOIN 4 bảng để lấy đầy đủ thông tin Khách hàng, Sản phẩm và SIZE
    const result = await query(`
      SELECT 
        o.id, 
        o.total_amount, 
        o.status, 
        o.created_at, 
        o.shipping_address,
        u.full_name as customer_name, 
        u.email as customer_email,
        -- Gộp tất cả sản phẩm trong đơn hàng thành một mảng JSON
        json_agg(
          json_build_object(
            'name', p.name,
            'quantity', oi.quantity,
            'size', oi.size, -- LẤY CỘT SIZE TẠI ĐÂY
            'price', oi.price
          )
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.full_name, u.email
      ORDER BY o.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("Admin Orders API Error:", error);
    return NextResponse.json({ error: "INTERNAL SERVER ERROR" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { orderId, status } = await req.json();
    await query("UPDATE orders SET status = $1 WHERE id = $2", [status, orderId]);
    return NextResponse.json({ message: "STATUS_UPDATED" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}