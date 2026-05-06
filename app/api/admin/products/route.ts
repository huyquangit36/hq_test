import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const result = await query("SELECT * FROM products ORDER BY id DESC");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const stock = formData.get("stock") as string;
    const color = formData.get("color") as string; // Thêm màu sắc
    const file = formData.get("image") as File;

    let imageUrl = "/products/tee-1.jpg";

    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
      const filename = Date.now() + "_" + file.name.replace(/\s+/g, "_");
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const result = await query(
      "INSERT INTO products (name, price, category, description, image_url, stock, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, parseFloat(price), category, description, imageUrl, parseInt(stock), color]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const stock = formData.get("stock") as string;
    const color = formData.get("color") as string; // Thêm màu sắc
    const file = formData.get("image") as File;
    const currentImage = formData.get("currentImage") as string;

    let imageUrl = currentImage;

    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filename = Date.now() + "_" + file.name.replace(/\s+/g, "_");
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const result = await query(
      "UPDATE products SET name=$1, price=$2, category=$3, description=$4, image_url=$5, stock=$6, color=$7 WHERE id=$8 RETURNING *",
      [name, parseFloat(price), category, description, imageUrl, parseInt(stock), color, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await query("DELETE FROM products WHERE id = $1", [id]);
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}