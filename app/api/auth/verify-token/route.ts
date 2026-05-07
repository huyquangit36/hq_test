import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    const result = await query(
      "SELECT * FROM password_resets WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP",
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    return NextResponse.json({ valid: true });
  } catch (error: any) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}