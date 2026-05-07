import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const statsQuery = await query(`
      WITH metrics AS (
        SELECT
          COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN total_amount ELSE 0 END), 0) as rev_current,
          COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                            AND created_at < date_trunc('month', CURRENT_DATE) THEN total_amount ELSE 0 END), 0) as rev_last,
          
          COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN id END) as ord_current,
          COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                            AND created_at < date_trunc('month', CURRENT_DATE) THEN id END) as ord_last,

          (SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE)) as user_current,
          (SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                                        AND created_at < date_trunc('month', CURRENT_DATE)) as user_last
        FROM orders
      )
      SELECT * FROM metrics;
    `);

    const m = statsQuery.rows[0];

    const calculateGrowth = (current: number, last: number) => {
      if (last === 0) return current > 0 ? "+100%" : "0%";
      const growth = ((current - last) / last) * 100;
      return (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
    };

    const overview = await query(`
      SELECT 
        (SELECT SUM(total_amount) FROM orders) as revenue,
        (SELECT COUNT(*) FROM orders) as orders,
        (SELECT COUNT(*) FROM users) as customers,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM products WHERE stock < 10) as low_stock_count,
        (SELECT COUNT(*) FROM comments WHERE is_answered = FALSE) as pending_count
    `);

    const statusDist = await query("SELECT status, COUNT(*)::int as count FROM orders GROUP BY status");

    const categoryDist = await query(`
      SELECT category, COUNT(*)::int as count, SUM(price)::float as revenue_share 
      FROM products GROUP BY category
    `);

    const topCustomers = await query(`
      SELECT u.full_name, u.email, SUM(o.total_amount) as total_spent, COUNT(o.id) as order_count
      FROM users u JOIN orders o ON u.id = o.user_id
      GROUP BY u.id ORDER BY total_spent DESC LIMIT 5
    `);

    return NextResponse.json({
      revenue: parseFloat(overview.rows[0].revenue || 0),
      orders: parseInt(overview.rows[0].orders || 0),
      customers: parseInt(overview.rows[0].customers || 0),
      totalProducts: parseInt(overview.rows[0].total_products || 0),
      lowStockCount: parseInt(overview.rows[0].low_stock_count || 0),
      pendingCount: parseInt(overview.rows[0].pending_count || 0),
      revenueGrowth: calculateGrowth(m.rev_current, m.rev_last),
      ordersGrowth: calculateGrowth(m.ord_current, m.ord_last),
      customersGrowth: calculateGrowth(m.user_current, m.user_last),
      statusDist: statusDist.rows || [],
      categoryDist: categoryDist.rows || [],
      topCustomers: topCustomers.rows || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}