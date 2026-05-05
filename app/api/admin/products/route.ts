import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises"; // Thêm mkdir
import path from "path";
import fs from "fs";

// --- 1. LẤY DANH SÁCH SẢN PHẨM (Sửa lỗi 405) ---
export async function GET() {
  try {
    const result = await query("SELECT * FROM products ORDER BY id DESC");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 2. THÊM SẢN PHẨM VÀ XỬ LÝ ẢNH (Sửa lỗi ENOENT) ---
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const stock = formData.get("stock") as string;
    const file = formData.get("image") as File;

    let imageUrl = "/products/tee-1.jpg"; // Ảnh mặc định

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ĐƯỜNG DẪN THƯ MỤC UPLOADS
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      // TỰ ĐỘNG TẠO THƯ MỤC NẾU CHƯA CÓ (Sửa lỗi ENOENT)
      if (!fs.existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const filename = Date.now() + "_" + file.name.replace(/\s+/g, "_");
      const uploadPath = path.join(uploadDir, filename);

      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const result = await query(
      "INSERT INTO products (name, price, category, description, image_url, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, parseFloat(price), category, description, imageUrl, parseInt(stock)]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Lỗi Server:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 3. XÓA SẢN PHẨM ---
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });

    await query("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ message: "Xóa thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}