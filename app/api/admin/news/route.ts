import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const res = await query(`
      SELECT * FROM news 
      ORDER BY published_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("Admin News GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const tag = formData.get("tag") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const published_at = formData.get("published_at") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = "";

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads");
      try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

      const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    const res = await query(
      `INSERT INTO news (title, tag, description, content, image_url, published_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, tag || 'ARCHIVE', description, content, imageUrl, published_at]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id");
    const title = formData.get("title");
    const tag = formData.get("tag");
    const description = formData.get("description");
    const content = formData.get("content");
    const published_at = formData.get("published_at");
    const currentImage = formData.get("currentImage") as string;
    const imageFile = formData.get("image") as File;

    let imageUrl = currentImage;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), "public/uploads");
      try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

      const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    const res = await query(
      `UPDATE news SET title=$1, tag=$2, description=$3, content=$4, image_url=$5, published_at=$6 
       WHERE id=$7 RETURNING *`,
      [title, tag, description, content, imageUrl, published_at, id]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    await query("DELETE FROM news WHERE id = $1", [id]);
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}