import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
   
    const overview = await query(`
      SELECT 
        (SELECT SUM(total_amount) FROM orders) as revenue,
        (SELECT COUNT(*) FROM orders) as orders,
        (SELECT COUNT(*) FROM users) as customers
    `);

    
    const statusDist = await query("SELECT status, COUNT(*) FROM orders GROUP BY status");

    
    const categoryDist = await query("SELECT category, COUNT(*) FROM products GROUP BY category");

    
    const topCustomers = await query(`
      SELECT u.full_name, u.email, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 3
    `);

    return NextResponse.json({
      revenue: parseFloat(overview.rows[0].revenue || 0),
      orders: parseInt(overview.rows[0].orders || 0),
      customers: parseInt(overview.rows[0].customers || 0),
      statusDist: statusDist.rows,
      categoryDist: categoryDist.rows,
      topCustomers: topCustomers.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}