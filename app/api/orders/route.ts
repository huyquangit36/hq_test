import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { user_id, total_amount, shipping_address, items } = await req.json();

    for (const item of items) {
      const res = await query("SELECT size_stocks, name FROM products WHERE id = $1", [item.product_id]);
      const product = res.rows[0];
      const stockForSize = product.size_stocks[item.size] || 0;

      if (stockForSize < item.quantity) {
        return NextResponse.json(
          { error: `OUT OF STOCK: ${product.name} (Size ${item.size}) only has ${stockForSize} left!` },
          { status: 400 }
        );
      }
    }

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
           (COALESCE((size_stocks->>$1)::int, 0) - $2)::text::jsonb
         )
         WHERE id = $3`,
        [item.size, item.quantity, item.product_id]
      );
    }

    return NextResponse.json({ message: "ORDER SECURED" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "INTERNAL SERVER ERROR" }, { status: 500 });
  }
}