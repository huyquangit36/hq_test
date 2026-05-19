import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const res = await query(`
      SELECT * FROM news 
      WHERE published_at <= NOW() 
      ORDER BY published_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, tag, description, content, image_url, is_featured, published_at } = body;

    const res = await query(
      `INSERT INTO news (title, tag, description, content, image_url, is_featured, published_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, tag || 'ARCHIVE', description, content, image_url, is_featured || false, published_at || new Date()]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}