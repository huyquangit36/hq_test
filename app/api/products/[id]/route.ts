import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const productId = parseInt(id);

    if (isNaN(productId)) {
      console.error("ID nhận được không phải là số:", id);
      return NextResponse.json({ error: "ID không hợp lệ: " + id }, { status: 400 });
    }

    const result = await query("SELECT * FROM products WHERE id = $1", [productId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại trong DB" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Lỗi Server:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}