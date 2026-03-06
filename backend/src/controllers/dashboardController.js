import pool from '../config/db.js'

export const getStats = async (req, res) => {
  try {
    const [users, orders, revenue, recentOrders] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*), status FROM orders GROUP BY status'),
      pool.query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'"),
      pool.query(`
        SELECT o.*, u.name as user_name FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC LIMIT 5
      `),
    ])
    res.json({
      totalUsers: Number(users.rows[0].count),
      ordersByStatus: orders.rows,
      totalRevenue: Number(revenue.rows[0].total),
      recentOrders: recentOrders.rows,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}