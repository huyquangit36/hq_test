import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const result = await query(`
      SELECT 
        oi.id as item_id,
        o.id as order_id,
        p.name,
        p.image_url,
        oi.price,
        oi.quantity,
        oi.size,
        o.status,
        o.created_at,
        r.id as review_id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN reviews r ON (r.product_id = p.id AND r.user_id = o.user_id)
      WHERE o.user_id = $1  -- BẮT BUỘC PHẢI LỌC THEO USER ID
      ORDER BY o.created_at DESC
    `, [userId]);

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error("HISTORY_FETCH_ERROR:", error.message);
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}