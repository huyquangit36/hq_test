import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT COUNT(*) FROM comments WHERE is_answered = FALSE");
    return NextResponse.json({ count: parseInt(result.rows[0].count) });
  } catch (error: any) {
    return NextResponse.json({ count: 0 });
  }
}