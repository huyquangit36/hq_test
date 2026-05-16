import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, total_amount, shipping_address, items } = body;

    if (!user_id) return NextResponse.json({ error: "USER_ID_MISSING" }, { status: 400 });
    if (!items || items.length === 0) return NextResponse.json({ error: "CART_EMPTY" }, { status: 400 });

    for (const item of items) {
      const res = await query("SELECT size_stocks, name FROM products WHERE id = $1", [item.product_id]);
      const product = res.rows[0];
      
      if (!product) return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 404 });

      const stocks = product.size_stocks || {};
      const currentStock = stocks[item.size] || 0;

      if (currentStock < item.quantity) {
        return NextResponse.json({ 
          error: `OUT_OF_STOCK: ${product.name} (Size ${item.size}) only has ${currentStock} units left.` 
        }, { status: 400 });
      }
    }

    // 2. TẠO ĐƠN HÀNG
    const orderResult = await query(
      "INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES ($1, $2, $3, $4) RETURNING id",
      [user_id, total_amount, 'Pending', shipping_address]
    );
    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await query(
        "INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES ($1, $2, $3, $4, $5)",
        [orderId, item.product_id, item.quantity, item.price, item.size]
      );

      await query(
        `UPDATE products 
         SET size_stocks = jsonb_set(
           size_stocks, 
           array[$1], 
           ((COALESCE(size_stocks->>$1, '0')::int) - $2)::text::jsonb
         )
         WHERE id = $3`,
        [item.size, item.quantity, item.product_id]
      );
    }

    return NextResponse.json({ 
      success: true,
      orderId: orderId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("CRITICAL_DATABASE_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}