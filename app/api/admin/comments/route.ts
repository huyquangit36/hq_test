import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT c.*, u.full_name, p.name as product_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN products p ON c.product_id = p.id
      ORDER BY c.is_answered ASC, c.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { commentId, reply } = await req.json();
    await query("UPDATE comments SET reply_content = $1, is_answered = TRUE WHERE id = $2", [reply, commentId]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await query("DELETE FROM comments WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}