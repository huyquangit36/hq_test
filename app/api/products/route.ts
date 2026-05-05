import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Ép Next.js không dùng cache để luôn hiện sản phẩm mới nhất
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // Lấy tất cả sản phẩm từ bảng products
    const result = await query("SELECT * FROM products ORDER BY id DESC");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}