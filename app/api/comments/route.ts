import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const result = await query(
      `SELECT c.*, u.full_name 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.product_id = $1 
       ORDER BY c.created_at DESC`,
      [productId]
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, product_id, content } = await req.json();
    const result = await query(
      "INSERT INTO comments (user_id, product_id, content) VALUES ($1, $2, $3) RETURNING *",
      [user_id, product_id, content]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}