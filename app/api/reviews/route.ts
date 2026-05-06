import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const user_id = formData.get("user_id") as string;
    const product_id = formData.get("product_id") as string;
    const rating = formData.get("rating") as string;
    const comment = formData.get("comment") as string;
    const file = formData.get("image") as File;

    let imageUrl = null;

    if (file && file.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "reviews");
      if (!fs.existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const filename = Date.now() + "_" + file.name.replace(/\s+/g, "_");
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/reviews/${filename}`;
    }

    const result = await query(
      "INSERT INTO reviews (user_id, product_id, rating, comment, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, product_id, parseInt(rating), comment, imageUrl]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}