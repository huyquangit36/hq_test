import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, full_name, phone, address, currentPassword, newPassword } = body;

    const userRes = await query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) return NextResponse.json({ error: "USER NOT FOUND" }, { status: 404 });
    const user = userRes.rows[0];

    let updateFields = [];
    let values = [];
    let count = 1;

    if (full_name) { updateFields.push(`full_name = $${count++}`); values.push(full_name); }
    if (phone !== undefined) { updateFields.push(`phone = $${count++}`); values.push(phone); }
    if (address !== undefined) { updateFields.push(`address = $${count++}`); values.push(address); }

    if (newPassword && newPassword.trim() !== "") {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: "CURRENT ACCESS KEY INCORRECT" }, { status: 400 });
      }
      
      const hashed = await bcrypt.hash(newPassword, 10);
      updateFields.push(`password_hash = $${count++}`); // Đổi thành password_hash
      values.push(hashed);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "NO CHANGES DETECTED" }, { status: 400 });
    }

    values.push(userId);
    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${count} RETURNING id, full_name, email, phone, address`;
    
    const updateRes = await query(sql, values);

    return NextResponse.json(updateRes.rows[0]);

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "PROTOCOL ERROR: " + error.message }, { status: 500 });
  }
}