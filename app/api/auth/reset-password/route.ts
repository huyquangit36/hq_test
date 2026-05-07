import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // 1. Tìm token
    const resetRes = await query(
      "SELECT * FROM password_resets WHERE token = $1",
      [token]
    );

    if (resetRes.rows.length === 0) {
      return NextResponse.json({ error: "Mã xác nhận không tồn tại" }, { status: 400 });
    }

    const resetData = resetRes.rows[0];
    const now = new Date();
    const expiryTime = new Date(resetData.expires_at);

    if (now > expiryTime) {
      await query("DELETE FROM password_resets WHERE token = $1", [token]);
      return NextResponse.json({ error: "Link đã hết hạn" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await query(
      "UPDATE users SET password_hash = $1 WHERE email = $2",
      [hashedPassword, resetData.email]
    );

    await query("DELETE FROM password_resets WHERE email = $1", [resetData.email]);

    return NextResponse.json({ message: "Thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi Server: " + error.message }, { status: 500 });
  }
}