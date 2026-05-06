import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sql = `
      SELECT o.id as order_id, o.status, o.created_at, 
             p.id as product_id, p.name, p.image_url, p.price,
             r.id as review_id
      FROM orders o
      JOIN products p ON TRUE
      LEFT JOIN reviews r ON r.user_id = o.user_id AND r.product_id = p.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;

    const result = await query(sql, [userId]);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}