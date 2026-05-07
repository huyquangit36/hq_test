import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT id, full_name, email, role, created_at FROM users ORDER BY id DESC");
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, full_name, email, role } = await req.json();
    const result = await query(
      "UPDATE users SET full_name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, full_name, email, role",
      [full_name, email, role, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}