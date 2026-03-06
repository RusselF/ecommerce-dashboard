import pool from '../config/db.js'

export const getOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin'
    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
    `
    const params = []
    if (!isAdmin) {
      params.push(req.user.id)
      query += ` WHERE o.user_id = $1`
    }
    query += ' ORDER BY o.created_at DESC'
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const createOrder = async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { items } = req.body
    let total = 0
    const orderItems = []
    for (const item of items) {
      const { rows } = await client.query(
        'SELECT * FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      )
      const product = rows[0]
      if (!product || product.stock < item.quantity) {
        throw new Error(`Stok tidak cukup untuk ${product?.name || item.product_id}`)
      }
      total += product.price * item.quantity
      orderItems.push({ ...item, price: product.price })
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      )
    }
    const { rows: orderRows } = await client.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
      [req.user.id, total]
    )
    const order = orderRows[0]
    for (const item of orderItems) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, item.product_id, item.quantity, item.price]
      )
    }
    await client.query('COMMIT')
    res.status(201).json(order)
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(400).json({ message: err.message })
  } finally {
    client.release()
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ message: 'Order tidak ditemukan' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}