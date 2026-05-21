import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { withAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return withAuth(request, async (_, user) => {
    try {
      const result = await query(
        "SELECT id, email, full_name, role, created_at FROM users WHERE id = $1",
        [user.userId],
      );

      if (!result.rows || result.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const userData = result.rows[0];

      return NextResponse.json({
        user: {
          id: userData.id,
          email: userData.email,
          fullName: userData.full_name,
          role: userData.role,
          createdAt: userData.created_at,
        },
      });
    } catch (error: any) {
      console.error("Get user error:", error.message);
      return NextResponse.json(
        { error: "Neural link failed during identity check" },
        { status: 500 },
      );
    }
  });
}
